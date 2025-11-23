from django.shortcuts import render
from rest_framework import viewsets, generics, filters
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Job
from users.permissions import IsEmployerOrAdmin, IsOwnerOrAdmin, IsJobSeekerOrAdmin
from .serializers import JobSerializer
from applications.serializers import ApplicationCreateSerializer
from applications.serializers import ApplicationSerializer
from django.db.models import Q
from rest_framework import status
from applications.models import Application
from django.shortcuts import render
from django.utils import timezone
from .models import JobCategory, Skill
from .serializers import (CategorySerializer, SkillSerializer, 
                          JobListSerializer, JobSerializer,
                          JobCreateSerializer, JobDetailSerializer)

# Create your views here.
class JobCategoryViewSet(viewsets.ModelViewSet):
    """API endpoint that allows job categories to be viewed."""
    queryset = JobCategory.objects.all().order_by('name')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]  # Anyone can see categories
    pagination_class = None

    def jobs(self, request, slug=None):
        """Get jobs for a specific category"""
        category = self.get_object()
        jobs = Job.objects.filter(category=category, application_deadline__gte=timezone.now())
        page = self.paginate_queryset(jobs)
        
        if page is not None:
            serializer = JobListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = JobListSerializer(jobs, many=True)
        return Response(serializer.data)


class SkillViewSet(viewsets.ModelViewSet):
    """API endpoint that allows skills to be viewed."""
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]  # Anyone can see skills
    pagination_class = None

class JobViewSet(viewsets.ModelViewSet):
    """ViewSet for managing job listings."""
    queryset = Job.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'job_type', 'experience_level', 'location', 'company']
    search_fields = ['title', 'description', 'company']
    ordering_fields = ['created_at', 'salary_min', 'salary_max']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'similar']:
            permission_classes = [AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsEmployerOrAdmin]
        elif self.action == 'apply':
            permission_classes = [IsJobSeekerOrAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'create':
            return JobCreateSerializer
        elif self.action == 'list':
            return JobListSerializer
        return JobDetailSerializer

    def get_queryset(self):
        queryset = Job.objects.filter(application_deadline__gte=timezone.now()).select_related('category', 'employer')
        
        # Advanced filtering
        salary_min = self.request.query_params.get('salary_min')
        salary_max = self.request.query_params.get('salary_max')
        
        if salary_min:
            queryset = queryset.filter(salary_min__gte=salary_min)
        if salary_max:
            queryset = queryset.filter(salary_max__lte=salary_max)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(employer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Apply for a job"""
        job = self.get_object()
        
        # Check if user already applied
        if Application.objects.filter(job=job, applicant=request.user).exists():
            return Response(
                {'error': 'You have already applied for this job.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ApplicationCreateSerializer(
            data=request.data,
            context={'request': request, 'job': job}
        )
        
        if serializer.is_valid():
            application = serializer.save(job=job, applicant=request.user)
            response_serializer = ApplicationSerializer(application)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def similar(self, request, pk=None):
        """Get similar jobs based on category and location"""
        job = self.get_object()
        similar_jobs = Job.objects.filter(
            Q(category=job.category) | Q(location=job.location)
        ).exclude(id=job.id).distinct()[:10]
        
        serializer = JobListSerializer(similar_jobs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def applications(self, request, pk=None):
        """Get all applications for a job"""
        job = self.get_object()
        
        # Check if user owns the job or is admin
        if job.employer != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'You do not have permission to view these applications.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        applications = job.applications.select_related('applicant')
        page = self.paginate_queryset(applications)
        
        if page is not None:
            serializer = ApplicationSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_jobs(self, request):
        """Get jobs posted by current user"""
        jobs = self.get_queryset().filter(employer=request.user)
        page = self.paginate_queryset(jobs)
        
        if page is not None:
            serializer = JobListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

class JobListView(generics.ListAPIView):
    queryset = Job.objects.all()
    serializer_class = JobListSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'company__name', 'location']
    ordering_fields = ['posted_at', 'title']
    permission_classes = []

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsOwnerOrAdmin]
