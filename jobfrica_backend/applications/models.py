from django.db import models
from jobs.models import Job
from users.models import CustomUser

# Create your models here.
class Application(models.Model):
    STATUS_CHOICES = (
        ('applied', 'Applied'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
        ('accepted', 'Accepted'),
        ('withdrawn', 'Withdrawn'),
    )
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='applications')
    cover_letter = models.TextField(blank=True, null=True)
    resume = models.FileField(upload_to='applications/resumes/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'applications'
        unique_together = ['job', 'applicant'] # Prevent multiple applications to the same job by the same user
        indexes = [
            models.Index(fields=['applicant', 'applied_at']),
            models.Index(fields=['applicant', 'status']),
            models.Index(fields=['job', 'status']),
        ]
    
    def __str__(self):
        return f"{self.applicant.username} - {self.job.title}"