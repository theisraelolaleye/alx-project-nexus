from django.core.management.base import BaseCommand
from users.models import CustomUser as User
from jobs.models import Job, JobCategory, Skill
from applications.models import Application

class Command(BaseCommand):
    help = 'Creates sample data for testing'
    def handle(self, *args, **kwargs):
        # Create sample users
        user1, created = User.objects.get_or_create(
            username='johndoe',
            first_name='John',
            last_name='Doe',
            defaults={'email': 'johndoe@example.com', 'role': 'job_seeker'},
        )
        if created:
            user1.set_password('password123')
            user1.save()
            self.stdout.write(self.style.SUCCESS('Created user johndoe'))
        else:
            self.stdout.write('User johndoe already exists')

        user2, created = User.objects.get_or_create(
            username='employer1',
            first_name='Employer',
            last_name='One',
            defaults={'email': 'employer1@example.com', 'role': 'employer', 'company_name': 'Tech Corp'},
        )
        if created:
            user2.set_password('password123')
            user2.save()
            self.stdout.write(self.style.SUCCESS('Created user employer1'))
        else:
            self.stdout.write('User employer1 already exists')

    # Add sample jobs, applications, etc. as needed
        category, _ = JobCategory.objects.get_or_create(name='Software Development')
        skill_python, _ = Skill.objects.get_or_create(name='Python')
        skill_django, _ = Skill.objects.get_or_create(name='Django')

        job1, created = Job.objects.get_or_create(
            title='Junior Python Developer',
            employer=user2,
            defaults={
                'description': 'An entry-level position for Python developers.',
                'company': 'Tech Corp',
                'location': 'Remote',
                'category': category,
                'experience_level': 'Entry',
                'job_type': 'Full-time',
                'salary_min': 50000,
                'salary_max': 70000,
            }
        )
        if created:
            job1.tags.add(skill_python, skill_django)
            self.stdout.write(self.style.SUCCESS('Created job Junior Python Developer'))
        else:
            self.stdout.write('Job Junior Python Developer already exists')

        application, created = Application.objects.get_or_create(
            job=job1,
            applicant=user1,
            defaults={'cover_letter': 'I am very interested in this position.'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created application for johndoe to Junior Python Developer'))
        else:
            self.stdout.write('Application for johndoe to Junior Python Developer already exists')