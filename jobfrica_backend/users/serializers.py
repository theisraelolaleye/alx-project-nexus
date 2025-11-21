from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.db.models import Count
from .models import CustomUser, UserProfile
from applications.models import Application
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'first_name', 'last_name', 'username', 'email', 'password', 'password_confirm', 'role', 'company_name', 'phone_number')
    
    def validate_email(self, value):
        """Check if email already exists"""
        if CustomUser.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value.lower()
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        # Company name required for employers
        if attrs.get('role') == 'employer' and not attrs.get('company_name'):
            raise serializers.ValidationError({
                "company_name": "Company name is required for employers."
            })
        
        return attrs
    
    @transaction.atomic
    def create(self, validated_data):
        """Create new user with encrypted password"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Create user
        user = CustomUser.objects.create_user(
            **validated_data,
            is_active=True
        )
        user.set_password(password)
        user.save()
        
        return user

class UserLoginSerializer(serializers.Serializer):
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
        else:
            raise serializers.ValidationError('Must include "email" and "password"')

        attrs['user'] = user
        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    """Detailed user profile serializer"""
    total_applications = serializers.SerializerMethodField()
    total_posted_jobs = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone_number', 'company_name', 'full_name', 
            'total_applications', 'total_posted_jobs',
            'date_joined', 'bio', 'location', 'resume'
        ]
        read_only_fields = [
            'id', 'email', 'role', 'date_joined'
        ]
    
    def get_full_name(self, obj):
        """Get user's full name"""
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
    
    def get_total_applications(self, obj):
        """Get total applications for job seekers"""
        if obj.role == 'job_seeker':
            return obj.applications.count()
        return None
    
    def get_total_posted_jobs(self, obj):
        """Get total posted jobs for employers"""
        if obj.role in ['employer', 'admin']:
            return obj.jobs.count()
        return None

class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """Validate old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "new_password": "New password fields didn't match."
            })
        return attrs
    
    def save(self):
        """Update user password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Check if user with email exists"""
        if not CustomUser.objects.filter(email=value.lower()).exists():
            # Don't reveal if email exists for security
            pass
        return value.lower()

class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "new_password": "Password fields didn't match."
            })
        return attrs

class EmployerProfileSerializer(serializers.ModelSerializer):
    """Detailed employer profile with statistics"""
    total_jobs = serializers.SerializerMethodField()
    total_applications_received = serializers.SerializerMethodField()
    recent_jobs = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'company_name',
            'first_name', 'last_name', 'phone',
            'total_jobs', 'total_applications_received',
            'recent_jobs', 'date_joined'
        ]
    
    def get_total_jobs(self, obj):
        return obj.jobs.count()
    
    def get_total_applications_received(self, obj):
        return Application.objects.filter(applications=obj).count()
    
    def get_recent_jobs(self, obj):
        recent = obj.jobs.order_by('-created_at')[:5]
        return [
            {
                'id': job.id,
                'title': job.title,
                'status': job.status,
                'applications_count': job.applications.count()
            }
            for job in recent
        ]

class JobSeekerProfileSerializer(serializers.ModelSerializer):
    """Detailed job seeker profile with application history"""
    total_applications = serializers.SerializerMethodField()
    application_status_summary = serializers.SerializerMethodField()
    recent_applications = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone', 'total_applications', 'application_status_summary',
            'recent_applications', 'date_joined'
        ]
    
    def get_total_applications(self, obj):
        return obj.applications.count()
    
    def get_application_status_summary(self, obj):
        summary = obj.applications.values('status').annotate(count=Count('id'))
        return {item['status']: item['count'] for item in summary}
    
    def get_recent_applications(self, obj):
        recent = obj.applications.select_related('job').order_by('-applied_at')[:5]
        return [
            {
                'id': app.id,
                'job_title': app.job.title,
                'company': app.job.company_name,
                'status': app.status,
                'applied_at': app.applied_at
            }
            for app in recent
        ]

class UserStatisticsSerializer(serializers.Serializer):
    """User statistics for dashboard"""
    total_users = serializers.IntegerField()
    total_employers = serializers.IntegerField()
    total_job_seekers = serializers.IntegerField()
    total_admins = serializers.IntegerField()
    active_users_today = serializers.IntegerField()
    new_users_this_week = serializers.IntegerField()
    new_users_this_month = serializers.IntegerField()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user data"""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['email'] = user.email
        token['role'] = user.role
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'username': self.user.username,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'company_name': self.user.company_name,
        }
        
        return data