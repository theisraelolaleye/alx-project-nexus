from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView, 
                                            TokenVerifyView, TokenBlacklistView)
from .views import (CustomTokenObtainPairView, UserRegistrationView, UserLogoutView, 
                    CombinedDashboardView, CurrentUserProfileView, UserStatisticsView,
                    PasswordChangeView, EmailVerificationView, ResendVerificationEmailView,
                    PasswordResetRequestView, PasswordResetConfirmView, AvatarUploadView)

# Router for ViewSets
router = DefaultRouter()
router.register(r'users', CombinedDashboardView, basename='user')

app_name = 'users'


urlpatterns = [
    # Authentication endpoints
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    
    # JWT token endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),
    
    # Profile endpoints
    path('profile/', CurrentUserProfileView.as_view(), name='profile'),
    path('profile/password/', PasswordChangeView.as_view(), name='change_password'),
    path('dashboard/', CombinedDashboardView.as_view(), name='dashboard'),
    path('profile/avatar/', AvatarUploadView.as_view(), name='avatar_upload'),
    
    # Password reset endpoints
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Email verification endpoints
    path('verify-email/<str:token>/', EmailVerificationView.as_view(), name='verify_email'),
    path('resend-verification/', ResendVerificationEmailView.as_view(), name='resend_verification'),
    
    # User management (admin only)
    path('', CombinedDashboardView.as_view(), name='dashboard'),
    
    # Statistics endpoint (admin only)
    path('statistics/', UserStatisticsView.as_view(), name='user_statistics'),
]