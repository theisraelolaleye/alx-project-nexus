from rest_framework import serializers
from .models import Job, JobCategory, Skill

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = ['id', 'name']
        

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class JobSerializer(serializers.ModelSerializer):
    """Nested serializer to show category details. read-only"""
    category = CategorySerializer
    
    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'company', 'location', 'posted_at', 'tags']
        read_only = ['id', 'posted_at']


class JobListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    application_count = serializers.SerializerMethodField()
    posted_by_name = serializers.CharField(source='employer.username', read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location', 'experience_level', 
            'job_type', 'category', 'salary_min', 'salary_max',
            'application_count', 'posted_by_name', 'created_at'
        ]
    
    def get_application_count(self, obj: Job) -> int:
        return obj.applications.count()

class JobDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=JobCategory.objects.all(),
        source='category',
        write_only=True
    )
    posted_by = serializers.SerializerMethodField()
    application_count = serializers.SerializerMethodField()
    search_vector = serializers.CharField(default='', read_only=True)
    
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['posted_by', 'search_vector', 'created_at']
    
    def get_posted_by(self, obj: Job) -> dict:
        """Return employer data for the job"""
        return {
            'id': obj.posted_by.id,
            'username': obj.posted_by.username,
            'company_name': obj.posted_by.company_name
        }
    
    def get_application_count(self, obj: Job) -> int:
        return obj.applications.count()
    

class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ('title', 'description', 'company', 'location', 'job_type', 
                 'experience_level', 'salary_min', 'salary_max', 'category', 
                 'application_url', 'application_email')