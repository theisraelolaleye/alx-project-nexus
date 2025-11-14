from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import JobApplication
from .serializers import JobApplicationSerializer
from core.permissions import IsApplicantOrCompanyAdmin, IsJobSeeker

# Create your views here.
class JobApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing job applications."""
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    
    def get_queryset(self):
        """Filter applications to only show relevant ones to the user."""
        user = self.request.user
        if not user.is_authenticated:
            return JobApplication.objects.none()
        if user.role == 'job_seeker':
            return self.queryset.filter(applicant=user)
        elif user.role in ['company_admin', 'employer']:
            return self.queryset.filter(job__company__admins=user)
        return JobApplication.objects.none()

    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create']:
            permission_classes = [IsJobSeeker]
        else:
            permission_classes = [IsApplicantOrCompanyAdmin]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Associate the applicant with the logged-in user."""
        serializer.save(applicant=self.request.user)

