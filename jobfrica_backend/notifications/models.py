from django.db import models

# Create your models here.
class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = (
        ('application_update', 'Application Update'),
        ('new_job_posting', 'New Job Posting'),
        ('company_announcement', 'Company Announcement'),
    )
    recipient = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_job = models.ForeignKey('jobs.Job', on_delete=models.CASCADE, blank=True, null=True, related_name='notifications')
    related_application = models.ForeignKey('applications.Application', on_delete=models.CASCADE, blank=True, null=True, related_name='notifications')
    created_at = models.DateTimeField(auto_now_add=True)