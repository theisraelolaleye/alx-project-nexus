from django.shortcuts import render
from rest_framework import viewsets, generics, filters
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Job
from django.http import Http404
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
    permission_classes = [AllowAny]  # Anyone can see categories
    pagination_class = None

    def jobs(self, request, slug=None):
        """Get jobs for a specific category"""
        category = self.get_object()
        jobs = Job.objects.filter(category=category, status='open')
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
    permission_classes = [AllowAny]  # Anyone can see skills
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
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsEmployerOrAdmin()]
        elif self.action == 'apply':
            return [IsAuthenticated()]
        return [AllowAny()]  # Default to public access

    def get_serializer_class(self):
        if self.action == 'create':
            return JobCreateSerializer
        elif self.action == 'list':
            return JobListSerializer
        elif self.action == 'retrieve':
            return JobDetailSerializer  # Use detail serializer for single job view
        return JobDetailSerializer

    def get_queryset(self):
        queryset = Job.objects.select_related('employer', 'category')
        # For LIST action only - apply role-based filtering
        if self.action == 'list':
            if not self.request.user.is_authenticated:
                # Public users only see active jobs
                queryset = queryset.filter(status='open')
            elif self.request.user.role == 'employer':
                # Employers see all their jobs in list view
                queryset = queryset.filter(employer=self.request.user)
            else:
                # Job seekers see active jobs
                queryset = queryset.filter(status='open')
        
        # For RETRIEVE action - allow access to specific job with permission checks
        # Don't apply the same filters for single job retrieval
        # The permission checks will happen in get_object()
        return queryset.prefetch_related('tags')

    def get_object(self):
        # Get the job first
        job = super().get_object()
        
        # Check if user can view this specific job
        if not self.request.user.is_authenticated:
            # Public users can only view active jobs
            if job.status != 'open':
                raise Http404("No Job matches the given query.")
        elif self.request.user.role == 'employer':
            # Employers can only view their own jobs
            if job.employer != self.request.user:
                raise Http404("No Job matches the given query.")
        else:
            # Job seekers can only view active jobs
            if job.status != 'open':
                raise Http404("No Job matches the given query.")
        return job
    
    def perform_create(self, serializer):
        serializer.save(employer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Apply for a job"""
        job = self.get_object()

        # Validate job is still active
        if job.status != 'open':
            return Response(
                {'error': 'Application deadline has passed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate user is a job seeker
        if request.user.role != 'job_seeker':
            return Response(
                {'error': 'Only job seekers can apply for jobs.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
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
        

