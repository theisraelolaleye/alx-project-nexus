from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.files.storage import default_storage
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator


def validate_image_size(image):
    """Validate image file size (max 5MB)"""
    file_size = image.size
    limit_mb = 5
    if file_size > limit_mb * 1024 * 1024:
        raise ValidationError(f'Image size should not exceed {limit_mb}MB')

def user_avatar_upload_path(instance, filename):
    """Generate upload path for user avatars"""
    return f'avatars/user_{instance.id}/{filename}'

# Create your models here.
class CustomUser(AbstractUser):
    ROLES_CHOICES = (
        ('job_seeker', 'Job Seeker'),
        ('employer', 'Employer'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLES_CHOICES, default='job_seeker')
    company_name = models.CharField(max_length=200, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    # Avatar field
    avatar = models.ImageField(
        upload_to=user_avatar_upload_path,
        null=True,
        blank=True,
        verbose_name='Profile Picture',
        help_text='Upload a profile picture (optional)',
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png']),
            validate_image_size
        ]
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
    
    @property
    def avatar_url(self):
        """Get avatar URL or return default"""
        if self.avatar and hasattr(self.avatar, 'url'):
            return self.avatar.url
        return '/static/images/default_avatar.png'  # Path to default avatar initials
    
    def get_avatar_initials(self):
        """Get user initials for avatar placeholder"""
        if self.first_name and self.last_name:
            return f"{self.first_name[0]}{self.last_name[0]}".upper()
        elif self.first_name:
            return self.first_name[0].upper()
        elif self.last_name:
            return self.last_name[0].upper()
        return self.username[0].upper() if self.username else 'U'
    
    def save(self, *args, **kwargs):
        # Delete old avatar when new one is uploaded
        if self.pk:
            try:
                old_instance = CustomUser.objects.get(pk=self.pk)
                if old_instance.avatar and old_instance.avatar != self.avatar:
                    if default_storage.exists(old_instance.avatar.name):
                        default_storage.delete(old_instance.avatar.name)
            except CustomUser.DoesNotExist:
                pass
        super().save(*args, **kwargs)
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]

class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s profile"