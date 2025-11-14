from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import JobCategory, Skill
from .serializers import JobCategorySerializer, SkillSerializer

# Create your views here.
class JobCategoryViewSet(viewsets.ModelViewSet):
    """API endpoint that allows job categories to be viewed."""
    queryset = JobCategory.objects.all().order_by('name')
    serializer_class = JobCategorySerializer
    permission_classes = [permissions.AllowAny]  # Anyone can see categories
    pagination_class = None


class SkillViewSet(viewsets.ModelViewSet):
    """API endpoint that allows skills to be viewed."""
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]  # Anyone can see skills
    pagination_class = None