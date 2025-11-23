from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Application
from .serializers import ApplicationCreateSerializer, ApplicationSerializer
from users.permissions import IsAdmin, IsEmployerOrAdmin, IsJobSeekerOrAdmin, IsOwnerOrAdmin

# Create your views here.
class ApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing job applications."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ApplicationSerializer
    queryset = Application.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        return ApplicationSerializer

    def get_queryset(self):
        """Filter applications to only show relevant ones to the user."""
        user = self.request.user

        # Check if user is authenticated and has the role attribute
        if not user.is_authenticated:
            return Application.objects.none()
        
        # Ensure user has the role attribute (handle AnonymousUser)
        if not hasattr(user, 'role'):
            return Application.objects.none()
        
        if user.user_type in ['employer']:
            """Employers can see applications for their jobs"""
            return Application.objects.filter(job__employer=user).select_related('job', 'applicant')
        elif user.user_type == 'jobseeker':
            """Job seekers can see their own applications"""
            return Application.objects.filter(applicant=user).select_related('job')
        elif user.role == 'admin':
            # Admins see all applications
            return Application.objects.all().select_related('applicant', 'job')
        return Application.objects.none()

    def perform_create(self, serializer):
        """Associate the applicant with the logged-in user."""
        serializer.save(applicant=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrAdmin])
    def update_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(Application.STATUS_CHOICES):
            application.status = new_status
            application.save()
            return Response({'status': application.status})
        
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def all_applications(self, request):
        """Admin can view all applications in the system."""
        applications = Application.objects.all().select_related('job', 'applicant')
        page = self.paginate_queryset(applications)
        
        if page is not None:
            serializer = ApplicationSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)
    
    def my_applications(self, request):
        """Job seekers can view their own applications."""
        user = request.user
        applications = Application.objects.filter(applicant=user).select_related('job')
        page = self.paginate_queryset(applications)
        
        if page is not None:
            serializer = ApplicationSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)