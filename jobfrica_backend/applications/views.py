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

    def get_serializer_class(self):
        if self.action == 'create':
            return ApplicationCreateSerializer
        return ApplicationSerializer

    def get_queryset(self):
        """Filter applications to only show relevant ones to the user."""
        user = self.request.user
        
        if user.user_type in ['admin', 'employer']:
            """Employers can see applications for their jobs"""
            return Application.objects.filter(job__employer=user).select_related('job', 'applicant')
        else:
            """Job seekers can see their own applications"""
            return Application.objects.filter(applicant=user).select_related('job')

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