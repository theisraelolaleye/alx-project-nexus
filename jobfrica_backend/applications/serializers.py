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
        fields = ('cover_letter', 'resume')

    # Custom create method to associate job and applicant
    def create(self, validated_data):
        job = self.context['job']
        applicant = self.context['request'].user
        application = Application.objects.create(
            job=job,
            applicant=applicant,
            cover_letter=validated_data.get('cover_letter', ''),
            resume=validated_data.get('resume', None)
        )
        return application
    
    # Validate to prevent multiple applications to the same job by the same user
    def validate(self, data):
        job = self.context['job']
        applicant = self.context['request'].user
        if Application.objects.filter(job=job, applicant=applicant).exists():
            raise serializers.ValidationError("You have already applied for this job.")
        return data