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
    serializer_class = ApplicationSerializer
    queryset = Application.objects.all()

    def get_permissions(self):
        """Assign permissions based on action."""
        if self.action in ['update', 'partial_update', 'update_status']:
            # Only employers who own the job can update applications
            return [IsEmployerOrAdmin()]
        elif self.action in ['create']:
            # Only job seekers can create applications
            return [IsJobSeekerOrAdmin()]
        elif self.action in ['destroy']:
            # Only admins or application owners can delete
            return [IsOwnerOrAdmin()]
        elif self.action in ['my_applications']:
            # Only authenticated users (job seekers) can view their applications
            return [permissions.IsAuthenticated()]
        else:
            # Default permission
            return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        return ApplicationSerializer

    def get_queryset(self):
        """Filter applications to only show relevant ones to the user."""
        user = self.request.user

        if not user.is_authenticated:
            return Application.objects.none()
        
        if not hasattr(user, 'role'):
            return Application.objects.none()
        if user.role == 'employer':
            """Employers can see applications for their jobs"""
            return Application.objects.filter(job__employer=user).select_related('job', 'applicant')
        elif user.role == 'job_seeker':
            """Job seekers can see their own applications"""
            return Application.objects.filter(applicant=user).select_related('job')
        elif user.role == 'admin':
            # Admins see all applications
            return Application.objects.all().select_related('applicant', 'job')
        return Application.objects.none()

    def perform_create(self, serializer):
        """Associate the applicant with the logged-in user."""
        if self.request.user.role != 'job_seeker':
            raise permissions.PermissionDenied("Only job seekers can apply for jobs")
        serializer.save(applicant=self.request.user)

    @action(detail=True, methods=['post', 'patch'], permission_classes=[IsEmployerOrAdmin])  
    def update_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get('status')
        
        # Verify the employer owns this job
        if application.job.employer != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'You can only update applications for your own jobs'},
                status=status.HTTP_403_FORBIDDEN
            )
        if new_status in dict(Application.STATUS_CHOICES).keys():
            application.status = new_status
            application.save()
            serializer = self.get_serializer(application)
            return Response(serializer.data)
        
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
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
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