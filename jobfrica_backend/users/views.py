from django.shortcuts import render
from rest_framework import generics, viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Avg
from django.db import models
from django.utils import timezone
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate, logout
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.db.models import Q, Count, F
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend
import csv
from django.http import HttpResponse
from .models import CustomUser
from jobs.models import Job
from applications.models import Application
import logging
from .permissions import IsAdmin
from .serializers import ( UserStatisticsSerializer, UserProfileSerializer, 
                          UserRegistrationSerializer, CustomTokenObtainPairSerializer,
                          PasswordChangeSerializer, UserLoginSerializer, UserLogoutSerializer,
                          ResendVerificationEmailSerializer, EmailVerificationSerializer, 
                          PasswordResetConfirmSerializer, PasswordResetRequestSerializer,
                          UserDashboardSerializer, PublicuserDashboardSerializer, DashboardResponseSerializer)

logger = logging.getLogger(__name__)

# Create your views here.

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view with additional user data"""
    serializer_class = CustomTokenObtainPairSerializer

class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        # Clean input data if it comes as lists
        cleaned_data = self.clean_request_data(request.data)
        
        # Create serializer with cleaned data
        serializer = self.get_serializer(data=cleaned_data)
        
        # Validate
        serializer.is_valid(raise_exception=True)
        
        # Save user
        user = serializer.save()
        
        # Send welcome email (don't let email failure break registration)
        try:
            self.send_welcome_email(user)
        except Exception as e:
            logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")
        
        # Generate tokens for auto-login
        refresh = RefreshToken.for_user(user)
        
        # Prepare response data with message in frontend
        response_data = {
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'company_name': user.company_name,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': ''
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    def clean_request_data(self, data):
        """Clean request data to handle list inputs"""
        cleaned = {}
        for key, value in data.items():
            if isinstance(value, list):
                cleaned[key] = value[0] if value else ''
            else:
                cleaned[key] = value
        return cleaned
    
    def send_welcome_email(self, user):
        """Send welcome email to newly registered user"""
        subject = 'Welcome to Job Board Platform'
        
        # Create email context
        context = {
            'user': user,
            'verification_link': self.get_verification_link(user),
            'login_url': f"{settings.FRONTEND_URL}/login",
            'support_email': settings.DEFAULT_FROM_EMAIL,
        }
        
        # Render email templates
        html_message = render_to_string('emails/welcome.html', context)
        plain_message = render_to_string('emails/welcome.txt', context)
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
    
    def get_verification_link(self, user):
        """Generate email verification link"""
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        return f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"
    
    
class UserLoginView(generics.CreateAPIView):
    """User login endpoint"""
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # This will trigger the serializer's validate method
        
        user = serializer.validated_data['user']
        
        if not user.is_active:
            return Response(
                {'error': 'Account is deactivated. Please contact support.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        refresh = RefreshToken.for_user(user)
        
        # Get user's role-specific data
        user_data = UserProfileSerializer(user).data
        
        return Response({
            'user': user_data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class UserLogoutView(generics.GenericAPIView):
    """Logout view that blacklists the refresh token"""
    permission_classes = []  # Remove IsAuthenticated to handle expired tokens
    serializer_class = UserLogoutSerializer

    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Try to blacklist the token
            token = RefreshToken(refresh_token)
            
            # Check if blacklist method exists
            if hasattr(token, 'blacklist'):
                token.blacklist()
                message = 'Successfully logged out. Token blacklisted.'
            else:
                # Blacklist not available, but we can still consider it logged out
                message = 'Successfully logged out. Token invalidated.'
            
            return Response(
                {'message': message},
                status=status.HTTP_200_OK
            )
            
        except TokenError as e:
            # Token is already invalid/expired, but we can still consider it logged out
            return Response(
                {'message': 'Successfully logged out. Token was already invalid.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to logout: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update current user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
class PasswordChangeView(generics.UpdateAPIView):
    """Change password endpoint"""
    serializer_class = PasswordChangeSerializer
    permission_classes = [IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer

class PasswordResetRequestView(generics.GenericAPIView):
    """
    Request password reset email
    """
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = CustomUser.objects.get(email=email)
            
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Send password reset email
            reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            
            subject = 'Password Reset Request'
            message = render_to_string('emails/password_reset.html', {
                'user': user,
                'reset_link': reset_link,
                'expiry_hours': 24,
            })
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=message,
                fail_silently=False,
            )
            
        except CustomUser.DoesNotExist:
            # Don't reveal that user doesn't exist
            pass
        except Exception as e:
            logger.error(f"Failed to send password reset email: {str(e)}")
        
        return Response({
            'message': 'If an account exists with this email, you will receive a password reset link.'
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(generics.GenericAPIView):
    """
    Confirm password reset with token
    """
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Decode uid and get user
        try:
            uid = force_str(urlsafe_base64_decode(request.data.get('uid')))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({
                'error': 'Invalid reset link'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify token
        if not default_token_generator.check_token(user, request.data.get('token')):
            return Response({
                'error': 'Invalid or expired reset link'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Send confirmation email
        try:
            subject = 'Password Reset Successful'
            message = render_to_string('emails/password_reset_success.html', {
                'user': user,
            })
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=message,
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send password reset confirmation email: {str(e)}")
        
        return Response({
            'message': 'Password reset successful. You can now login with your new password.'
        }, status=status.HTTP_200_OK)


class EmailVerificationView(generics.GenericAPIView):
    """
    Verify user email address
    """
    permission_classes = [AllowAny]
    serializer_class = EmailVerificationSerializer
    
    def get(self, request, token, *args, **kwargs):
        """
        Verify email using token from URL
        """
        try:
            uidb64 = request.GET.get('uid')
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({
                'error': 'Invalid verification link'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if user.email_verified:
            return Response({
                'message': 'Email is already verified.'
            }, status=status.HTTP_200_OK)
        
        if default_token_generator.check_token(user, token):
            user.email_verified = True
            user.save(update_fields=['email_verified'])
            return Response({
                'message': 'Email verified successfully.'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Invalid or expired verification link.'
            }, status=status.HTTP_400_BAD_REQUEST)
    

class ResendVerificationEmailView(generics.GenericAPIView):
    """
    Resend email verification link
    """
    permission_classes = []  # Allow anyone to request verification resend
    serializer_class = ResendVerificationEmailSerializer
    
    def post(self, request):
        """
        Resend verification email to the provided email address
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].lower()
        try:
            user = CustomUser.objects.get(email=email)
            
            if user.email_verified:
                return Response({
                    'message': 'Email is already verified.'
                }, status=status.HTTP_200_OK)
            
            # Generate new verification token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Send verification email
            verification_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"
            
            subject = 'Resend Email Verification'
            message = render_to_string('emails/verify_email.html', {
                'user': user,
                'verification_link': verification_link,
            })
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=message,
                fail_silently=False,
            )
            
            return Response(status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            # Don't reveal whether email exists for security
            return Response({
                'message': 'If an account with this email exists, a verification link has been sent.'
            }, status=status.HTTP_200_OK)
    
    def send_verification_email(self, user, verification_link):
        """Send verification email to user"""
        subject = 'Email Verification'
        message = render_to_string('emails/verify_email.html', {
            'user': user,
            'verification_link': verification_link,
        })
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=message,
            fail_silently=False,
        )
        

class UserDashboardView(APIView):
    """
    Get dashboard data for authenticated user
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserDashboardSerializer
    
    def get(self, request):
        user = request.user
        
        dashboard_data = {
            'user': UserProfileSerializer(user).data,
            'statistics': {}
        }
        
        if user.role == 'employer':
            # Employer dashboard data
            dashboard_data['statistics'] = {
                'total_jobs_posted': user.posted_jobs.count(),
                'active_jobs': user.posted_jobs.filter(application_deadline__gte=timezone.now()).count(),
                'total_applications_received': Application.objects.filter(
                    job__posted_by=user
                ).count(),
                'pending_applications': Application.objects.filter(
                    job__posted_by=user,
                    status='pending'
                ).count(),
                'recent_applications': self.get_recent_applications_for_employer(user),
                'job_performance': self.get_job_performance(user),
            }
            
        elif user.role == 'jobseeker':
            # Job seeker dashboard data
            dashboard_data['statistics'] = {
                'total_applications': user.applications.count(),
                'pending_applications': user.applications.filter(status='pending').count(),
                'shortlisted_applications': user.applications.filter(status='shortlisted').count(),
                'rejected_applications': user.applications.filter(status='rejected').count(),
                'recent_applications': self.get_recent_applications_for_jobseeker(user),
                'application_timeline': self.get_application_timeline(user),
            }
            
        elif user.role == 'admin':
            # Admin dashboard data
            dashboard_data['statistics'] = {
                'total_users': CustomUser.objects.count(),
                'total_jobs': Job.objects.count(),
                'total_applications': Application.objects.count(),
                'pending_job_approvals': Job.objects.filter(status='draft').count(),
                'recent_users': self.get_recent_users(),
                'platform_metrics': self.get_platform_metrics(),
            }
        
        return Response(dashboard_data)
    
    def get_recent_applications_for_employer(self, user):
        """Get recent applications for employer's jobs"""
        applications = Application.objects.filter(
            job__posted_by=user
        ).select_related('job', 'applicant').order_by('-applied_at')[:10]
        
        return [{
            'id': app.id,
            'applicant_name': app.applicant.get_full_name() or app.applicant.username,
            'job_title': app.job.title,
            'applied_at': app.applied_at,
            'status': app.status
        } for app in applications]
    
    def get_recent_applications_for_jobseeker(self, user):
        """Get recent applications for job seeker"""
        applications = user.applications.select_related('job').order_by('-applied_at')[:10]
        
        return [{
            'id': app.id,
            'job_title': app.job.title,
            'company': app.job.company_name,
            'applied_at': app.applied_at,
            'status': app.status
        } for app in applications]
    
    def get_job_performance(self, user):
        """Get job posting performance metrics"""
        jobs = user.posted_jobs.annotate(
            application_count=Count('applications')
        )
        
        return [{
            'job_id': job.id,
            'title': job.title,
            'views': getattr(job, 'views', 0),
            'applications': job.application_count,
            'status': job.status
        } for job in jobs[:5]]
    
    def get_application_timeline(self, user):
        """Get application timeline for job seeker"""
        timeline = []
        for i in range(30):
            date = timezone.now().date() - timedelta(days=i)
            count = user.applications.filter(applied_at__date=date).count()
            timeline.append({
                'date': date.isoformat(),
                'applications': count
            })
        return list(reversed(timeline))
    
    def get_recent_users(self):
        """Get recently registered users for admin"""
        users = CustomUser.objects.order_by('-date_joined')[:10]
        
        return [{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'date_joined': user.date_joined
        } for user in users]
    
    def get_platform_metrics(self):
        """Get platform-wide metrics for admin"""
        today = timezone.now().date()
        
        return {
            'jobs_posted_today': Job.objects.filter(created_at__date=today).count(),
            'applications_today': Application.objects.filter(applied_at__date=today).count(),
            'new_users_today': CustomUser.objects.filter(date_joined__date=today).count(),
            'active_jobs': Job.objects.filter(status='published').count(),
        }

class PublicDashboardView(APIView):
    """
    Get public dashboard data for unauthenticated users
    """
    permission_classes = [AllowAny]
    serializer_class = PublicuserDashboardSerializer
    
    def get(self, request):
        # Basic platform statistics
        from jobs.models import Job
        try:
            total_jobs = Job.objects.count()
        
            # Use a subquery or direct Job model filtering
            total_companies = CustomUser.objects.filter(
                role='employer', 
                is_active=True,
                id__in=Job.objects.filter(application_deadline__gte=timezone.now()).values('employer')
            ).distinct().count()
            
            # Recent job postings
            recent_jobs = self.get_recent_jobs()
            
            dashboard_data = {
                'platform_statistics': {
                    'total_jobs': total_jobs,
                    'total_companies': total_companies,
                    'new_jobs_today': Job.objects.filter(
                        created_at__date=timezone.now().date(),
                    ).count(),
                },
                'recent_jobs': recent_jobs,
            }
            
            return Response(dashboard_data)
        except Exception as e:
            # Graceful fallback if jobs table doesn't exist
            return Response({
                'platform_statistics': {
                    'total_jobs': 0,
                    'total_companies': 0,
                    'new_jobs_today': 0,
                },
                'recent_jobs': [],
                'message': 'Platform data is being initialized'
            })
        
    def get_recent_jobs(self):
        """Get recently posted jobs"""
        from jobs.models import Job
        try:
            jobs = Job.objects.filter(
                application_deadline__gte=timezone.now()
            ).select_related('employer').order_by('-created_at')[:10]
            
            return [{
                'id': job.id,
                'title': job.title,
                'company_name': job.employer.company_name,
                'location': job.location,
                'posted_at': job.created_at,
                'application_deadline': job.application_deadline,
            } for job in jobs]
        except Exception as e:
            return [] # Graceful fallback if jobs table doesn't exist

class CombinedDashboardView(APIView):
    """
    Combined dashboard that handles both authenticated and unauthenticated users
    """
    permission_classes = [AllowAny]
    serializer_class = DashboardResponseSerializer
    
    def get(self, request):
        if request.user.is_authenticated:
            # Use the authenticated user dashboard
            authenticated_view = UserDashboardView()
            authenticated_view.request = request
            return authenticated_view.get(request)
        else:
            # Use the public dashboard
            public_view = PublicDashboardView()
            public_view.request = request
            return public_view.get(request)

class AvatarUploadView(generics.UpdateAPIView):
    """
    Upload or update user avatar
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def post(self, request, *args, **kwargs):
        user = self.get_object()
        avatar_file = request.FILES.get('avatar')
        
        if not avatar_file:
            return Response(
                {'error': 'No avatar file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.avatar = avatar_file
        user.save(update_fields=['avatar'])
        
        return Response(
            {'message': 'Avatar updated successfully', 'avatar_url': user.get_avatar_url()},
            status=status.HTTP_200_OK
        )
    
    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        user.avatar.delete(save=True)
        
        return Response(
            {'message': 'Avatar removed successfully', 'avatar_url': user.get_avatar_url()},
            status=status.HTTP_200_OK
        )

class UserStatisticsView(APIView):
    """
    ViewSet for user management (Admin only)
    Provides CRUD operations for users
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserStatisticsSerializer
    permission_classes = [IsAdmin]
    def get(self, request):
        # Calculate statistics
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        stats = {
            'total_users': CustomUser.objects.count(),
            'total_employers': CustomUser.objects.filter(role='employer').count(),
            'total_job_seekers': CustomUser.objects.filter(role='jobseeker').count(),
            'total_admins': CustomUser.objects.filter(role='admin').count(),
            'active_users_today': CustomUser.objects.filter(
                last_login__date=today
            ).count(),
            'new_users_this_week': CustomUser.objects.filter(
                date_joined__gte=week_ago
            ).count(),
            'new_users_this_month': CustomUser.objects.filter(
                date_joined__gte=month_ago
            ).count(),
            'inactive_users': CustomUser.objects.filter(is_active=False).count(),
            
            # Role-based statistics
            'statistics_by_role': {
                'employers': {
                    'total': CustomUser.objects.filter(role='employer').count(),
                    'active': CustomUser.objects.filter(role='employer', is_active=True).count(),
                    'with_jobs': CustomUser.objects.filter(
                        role='employer',
                        posted_jobs__isnull=False
                    ).distinct().count(),
                },
                'job_seekers': {
                    'total': CustomUser.objects.filter(role='jobseeker').count(),
                    'active': CustomUser.objects.filter(role='jobseeker', is_active=True).count(),
                    'with_applications': CustomUser.objects.filter(
                        role='jobseeker',
                        applications__isnull=False
                    ).distinct().count(),
                }
            },
            
            # Growth metrics
            'growth_metrics': self.get_growth_metrics(),
        }
        
        serializer = UserStatisticsSerializer(stats)
        return Response(serializer.data)
    
    def get_growth_metrics(self):
        """Calculate user growth metrics"""
        today = timezone.now().date()
        metrics = []
        
        for i in range(30):
            date = today - timedelta(days=i)
            count = CustomUser.objects.filter(date_joined__date=date).count()
            metrics.append({
                'date': date.isoformat(),
                'new_users': count
            })
        
        return list(reversed(metrics))
