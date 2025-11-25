from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.db.models import Count
from .models import CustomUser, UserProfile
from applications.models import Application
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = CustomUser
        fields = (
            'id', 'first_name', 'last_name', 'username', 
            'email', 'password', 'password_confirm',  # Fixed field name
            'company_name', 'phone_number'
        )
        read_only_fields = ('id',)
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': False},
        }
    
    def validate_email(self, value):
        """Check if email already exists"""
        if value:
            email_lower = value.lower()
            if CustomUser.objects.filter(email__iexact=email_lower).exists():
                raise serializers.ValidationError("User with this email already exists.")
            return email_lower
        return value
    
    def validate_username(self, value):
        """Check if username already exists"""
        if value:
            username_lower = value.lower()
            if CustomUser.objects.filter(username__iexact=username_lower).exists():
                raise serializers.ValidationError("This username is already taken.")
            return username_lower
        return value
    
    def validate(self, attrs):
        """Validate password confirmation and role-specific requirements"""
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        if password != password_confirm:
            raise serializers.ValidationError({
                "password_confirm": "Password fields didn't match."
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
        # Remove password_confirm as it's not a model field
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        
        # make employer and jobseeker the only roles during registration
        role = validated_data.get('role', 'job_seeker')
        if role not in ['job_seeker', 'employer']:
            role = 'job_seeker'
        validated_data['role'] = role
        user = CustomUser.objects.create(**validated_data)
        
        # Set password properly
        user.set_password(password)
        user.save()
        
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate_email(self, value):
        """Clean the email/username field"""
        # Handle list input
        if isinstance(value, list):
            value = value[0] if value else ''
        
        # Ensure it's a string
        if not isinstance(value, str):
            raise serializers.ValidationError("Email must be a string")
        
        return value.strip().lower()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError('Must include email and password')
        
        user = None
        request = self.context.get('request')
        
        # Check if it's an email
        if '@' in email:
            try:
                # Find user by email
                user_obj = CustomUser.objects.get(email__iexact=email)
                # Authenticate with email and password
                user = authenticate(
                    request=request,
                    username=user_obj.email,
                    password=password
                )
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError('Invalid credentials')
        else:
            # Authenticate with username and password
            user = authenticate(
                request=request,
                username=email,
                password=password
            )
            
        
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        
        if not user.is_active:
            raise serializers.ValidationError('Account is deactivated')
        
        attrs['user'] = user
        return attrs

class UserLogoutSerializer(serializers.Serializer):
    """Serializer for user logout"""
    pass

class UserDashboardSerializer(serializers.Serializer):
    """Authenticated user dashboard serializer"""
    pass
    

class PublicuserDashboardSerializer(serializers.Serializer):
    """Dashoboard for unauthenticated serializer"""
    pass

class DashboardResponseSerializer(serializers.Serializer):
    """Base serializer for dashboard responses"""
    user = UserDashboardSerializer(required=False)
    public_data = PublicuserDashboardSerializer(required=False)


class UserProfileSerializer(serializers.ModelSerializer):
    """Detailed user profile serializer"""
    full_name = serializers.SerializerMethodField()
    bio = serializers.CharField(source='profile.bio', allow_blank=True, required=False)
    location = serializers.CharField(source='profile.location', allow_blank=True, required=False)
    resume = serializers.FileField(source='profile.resume', allow_null=True, required=False)
    avatar_url = serializers.CharField(read_only=True)
    avatar_initials = serializers.CharField(source='get_avatar_initials', read_only=True)
    """Detailed employer profile with statistics"""
    total_posted_jobs = serializers.SerializerMethodField()
    total_applications_received = serializers.SerializerMethodField()
    recent_jobs = serializers.SerializerMethodField()
    """Detailed job seeker profile with application history"""
    application_status_summary = serializers.SerializerMethodField()
    recent_applications = serializers.SerializerMethodField()
    total_applications = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone_number', 'company_name', 'full_name', 
            'total_applications', 'total_posted_jobs', 'date_joined', 
            'recent_jobs', 'total_applications_received', 
            'application_status_summary', 'recent_applications', 
            'bio', 'location', 'resume', 'avatar_url', 'avatar_initials'
        ]
        read_only_fields = [
            'id', 'email', 'role', 'date_joined'
        ]
    
    def get_full_name(self, obj: CustomUser) -> str:
        """Get user's full name"""
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
    
    def get_avatar_url(self, obj):
        return obj.avatar_url
    
    def get_avatar_initials(self, obj):
        return obj.get_avatar_initials()
    
    def update(self, instance, validated_data):
        """Handle profile update including nested profile fields"""
        profile_data = validated_data.pop('profile', {})
        bio = profile_data.get('bio', None)
        location = profile_data.get('location', None)
        resume = profile_data.get('resume', None)
        avatar = validated_data.pop('avatar', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        # Update or create user profile
        profile, created = UserProfile.objects.get_or_create(user=instance)
        if bio is not None:
            profile.bio = bio
        if location is not None:
            profile.location = location
        if resume is not None:
            profile.resume = resume
        profile.save()
        # Update avatar if provided
        if avatar is not None:
            instance.avatar = avatar
            instance.save()
        return instance

    """Getters for job seekers"""    
    def get_total_applications(self, obj: CustomUser) -> int:
        """Get total applications for job seekers"""
        if obj.role == 'job_seeker':
            return obj.applications.count()
        return None
    def get_application_status_summary(self, obj: CustomUser) -> dict:
        """Get application status summary for job seekers"""
        if obj.role == 'job_seeker':
            summary = obj.applications.values('status').annotate(count=Count('id'))
            return {item['status']: item['count'] for item in summary}
        return None
    def get_recent_applications(self, obj: CustomUser) -> list:
        """Get recent applications for job seekers"""
        if obj.role == 'job_seeker':
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
        return None

    """Getters for employers and admins"""
    def get_total_posted_jobs(self, obj: CustomUser) -> int:
        """Get total posted jobs for employers"""
        if obj.role in ['employer', 'admin']:
            return obj.jobs.count()
        return None
    def get_total_applications_received(self, obj: CustomUser) -> int:
        """Get total applications received for employers"""
        if obj.role in ['employer', 'admin']:
            return Application.objects.filter(job__employer=obj).count()
        return None
    def get_recent_jobs(self, obj: CustomUser) -> list:
        """Get recent jobs posted by employers"""
        if obj.role in ['employer', 'admin']:
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
    
class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification
    """
    token = serializers.CharField(required=True)

class ResendVerificationEmailSerializer(serializers.Serializer):
    """
    Serializer for resending verification email
    """
    email = serializers.EmailField(required=True)

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