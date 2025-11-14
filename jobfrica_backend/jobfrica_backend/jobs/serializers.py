from rest_framework import serializers
from .models import Job
from tags.serializers import JobCategorySerializer

class JobSerializer(serializers.ModelSerializer):
    """Nested serializer to show category details. read-only"""
    category = JobCategorySerializer
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'company', 'location', 'posted_at', 'tags']
        read_only = ['id', 'posted_at']
