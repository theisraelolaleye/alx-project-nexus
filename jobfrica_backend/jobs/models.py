from django.db import models
from users.models import CustomUser
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex

# Create your models here.
class JobCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    
class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Job(models.Model):
    JOB_TYPE_CHOICES = (
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('freelance', 'Freelance'),
        ('remote', 'Remote'),
    )

    EXPERIENCE_LEVEL_CHOICES = (
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level'),
    )

    STATUS_CHOICES = (
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('paused', 'Paused'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    employer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=False, blank=False, related_name='jobs')
    company = models.CharField(max_length=200)
    location = models.CharField(max_length=255)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    application_url = models.URLField(blank=True, null=True)
    application_email = models.EmailField(blank=True, null=True)
    posted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    category = models.ForeignKey(JobCategory, on_delete=models.PROTECT, related_name='jobs')
    tags = models.ManyToManyField(Skill, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # Search optimization fields
    search_vector = SearchVectorField(null=True)

    class Meta:
        db_table = 'jobs'
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['category']),
            models.Index(fields=['status']),
            models.Index(fields=['location']),
            models.Index(fields=['job_type']),
            models.Index(fields=['company']),
            GinIndex(fields=['search_vector']),
        ]

    def __str__(self):
        return f"{self.title} at {self.company.name}"
