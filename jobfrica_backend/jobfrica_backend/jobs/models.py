from django.db import models

# Create your models here.
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

    title = models.CharField(max_length=255)
    description = models.TextField()
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='jobs')
    location = models.CharField(max_length=255)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    posted_at = models.DateTimeField(auto_now_add=True)
    application_deadline = models.DateTimeField(blank=True, null=True)
    categories = models.ManyToManyField('tags.JobCategory', on_delete=models.SET_NULL, null=True)
    tags = models.ManyToManyField('tags.Skill', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        class Meta:
            indexes = [
                models.Index(fields=['categories', 'is_active']),
                models.Index(fields=['location', 'is_active']),
                models.Index(fields=['experience_level', 'is_active']),
                models.Index(fields=['job_type', 'is_active']),
                models.Index(fields=['created_at']),
            ]

    def __str__(self):
        return f"{self.title} at {self.company.name}"
