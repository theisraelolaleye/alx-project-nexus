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
from django.utils import timezone
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
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
from .permissions import IsAdmin, IsEmployerOrAdmin, IsJobSeekerOrAdmin, IsOwnerOrAdmin
from .serializers import ( UserStatisticsSerializer, UserProfileSerializer, 
                          UserRegistrationSerializer, CustomTokenObtainPairSerializer,
                          EmployerProfileSerializer, JobSeekerProfileSerializer,
                          PasswordChangeSerializer, UserLoginSerializer, PublicUserSerializer,
                          PasswordResetConfirmSerializer, PasswordResetRequestSerializer)

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
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send welcome email
        self.send_welcome_email(user)
        
        # Generate tokens for auto-login after registration
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful. Please check your email for verification.'
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    def send_welcome_email(self, user):
        """Send welcome email to newly registered user"""
        try:
            subject = 'Welcome to Job Board Platform'
            message = render_to_string('emails/welcome.html', {
                'user': user,
                'verification_link': self.get_verification_link(user)
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
            logger.error(f"Failed to send welcome email: {str(e)}")
    
    def get_verification_link(self, user):
        """Generate email verification link"""
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        return f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}"


class UserLoginView(generics.CreateAPIView):
    """User login endpoint"""
    queryset = CustomUser.objects.all()
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Allow login with email
        email = request.data.get('email', '')
        password = request.data.get('password', '')
        
        user = None
        
        # Try to authenticate with email
        if '@' in email:
            try:
                user_obj = CustomUser.objects.get(email=email.lower())
                user = authenticate(
                    request=request,
                    email=user_obj.email,
                    password=password
                )
            except CustomUser.DoesNotExist:
                pass
        else:
            # Authenticate with username
            user = authenticate(
                request=request,
                email=email,
                password=password
            )
        
        if user:
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
            if user.role == 'employer':
                user_data = EmployerProfileSerializer(user).data
            elif user.role == 'jobseeker':
                user_data = JobSeekerProfileSerializer(user).data
            else:
                user_data = UserProfileSerializer(user).data
            
            return Response({
                'user': user_data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'message': 'Login successful'
            })
        
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

class UserLogoutView(APIView):
    """Logout view that blacklists the refresh token"""
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            logout(request)
            
            return Response(
                {'message': 'Successfully logged out'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to logout'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
class CurrentUserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update current user profile"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            user = self.request.user
            if user.role == 'employer':
                return EmployerProfileSerializer
            elif user.role == 'jobseeker':
                return JobSeekerProfileSerializer
        return UserProfileSerializer
    
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
            user = User.objects.get(email=email)
            
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
            
        except User.DoesNotExist:
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
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
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


class EmailVerificationView(APIView):
    """
    Verify user email address
    """
    permission_classes = [AllowAny]
    
    def get(self, request, token, *args, **kwargs):
        try:
            # Decode uid from URL
            uid = kwargs.get('uid')
            user_id = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=user_id)
            
            # Check if token is valid
            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.email_verified = True
                user.save()
                
                return Response({
                    'message': 'Email verified successfully'
                }, status=status.HTTP_200_OK)
            
            return Response({
                'error': 'Invalid or expired verification link'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({
                'error': 'Invalid verification link'
            }, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationEmailView(APIView):
    """
    Resend email verification link
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if hasattr(user, 'email_verified') and user.email_verified:
            return Response({
                'message': 'Email is already verified'
            }, status=status.HTTP_200_OK)
        
        try:
            # Generate new verification token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            verification_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}"
            
            # Send verification email
            subject = 'Verify Your Email Address'
            message = render_to_string('emails/email_verification.html', {
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
            
            return Response({
                'message': 'Verification email sent successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to send verification email: {str(e)}")
            return Response({
                'error': 'Failed to send verification email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserDashboardView(APIView):
    """
    Get dashboard data for authenticated user
    """
    permission_classes = [IsAuthenticated]
    
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
                'active_jobs': user.posted_jobs.filter(is_active=True).count(),
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
    
    def get(self, request):
        # Basic platform statistics
        total_jobs = Job.objects.filter().count()
        total_companies = CustomUser.objects.filter(
            role='employer', 
            is_active=True,
            jobs__status='active',
            jobs__is_approved=True
        ).distinct().count()
        
        # Recent job postings
        recent_jobs = self.get_recent_jobs()
        
        dashboard_data = {
            'platform_statistics': {
                'total_jobs': total_jobs,
                'total_companies': total_companies,
                'new_jobs_today': Job.objects.filter(
                    created_at__date=timezone.now().date()
                ).count(),
            },
            'recent_jobs': recent_jobs,
        }
        
        return Response(dashboard_data)
    
    def get_recent_jobs(self):
        """Get recently posted jobs"""
        from jobs.models import Job
        
        jobs = Job.objects.filter().select_related('posted_by').order_by('-created_at')[:8]
        
        return [{
            'id': job.id,
            'title': job.title,
            'company': job.posted_by.company,
            'location': job.location,
            'job_type': job.job_type,
            'salary_min': job.salary_min,
            'salary_max': job.salary_max,
            'created_at': job.created_at,
            'is_new': job.created_at.date() == timezone.now().date()
        } for job in jobs]


class CombinedDashboardView(APIView):
    """
    Combined dashboard that handles both authenticated and unauthenticated users
    """
    permission_classes = [AllowAny]
    
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
