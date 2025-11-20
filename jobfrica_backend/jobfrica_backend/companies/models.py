from django.db import models

# Create your models here.
class Company(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    logo= models.ImageField(upload_to='company_logos/', blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    employee_count = models.IntegerField(blank=True, null=True)
    founded_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return super().__str__() + f" - {self.name}"
    
class CompanyAdmin(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='admins')
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE, related_name='company_admin_roles')
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Admin of {self.company.name}"