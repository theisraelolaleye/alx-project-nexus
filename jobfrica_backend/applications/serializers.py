from rest_framework import serializers
from .models import Application
from jobs.serializers import JobListSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)
    applicant = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('applicant', 'applied_at', 'status')
    
class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('job', 'cover_letter', 'resume')

    def validate(self, attrs):
        user = self.context['request'].user
        job = attrs['job']
        
        if Application.objects.filter(job=job, applicant=user).exists():
            raise serializers.ValidationError("You have already applied for this job.")
        
        return attrs