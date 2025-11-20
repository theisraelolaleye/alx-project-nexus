from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Company, CompanyAdmin
from .serializers import CompanySerializer, CompanyAdminSerializer
from core.permissions import IsEmployer, IsCompanyAdmin

# Create your views here.
class CompanyViewSet(viewsets.ModelViewSet):
    """ViewSet for managing companies."""
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create']:
            permission_classes = [IsEmployer]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsCompanyAdmin]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Associate the creator as a company admin."""
        company = serializer.save()
        CompanyAdmin.objects.create(user=self.request.user, company=company)