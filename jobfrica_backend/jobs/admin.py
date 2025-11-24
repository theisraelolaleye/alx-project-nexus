from django.contrib import admin
from .models import Job, JobCategory, Skill

# Register your models here.
admin.site.register(Job)
admin.site.register(JobCategory)
admin.site.register(Skill)