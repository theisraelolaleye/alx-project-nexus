from rest_framework import serializers
from .models import Company, CompanyAdmin
from users.serializers import UserSerializer

class CompanyAdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CompanyAdmin
        fields = ['id', 'user', 'company', 'added_at']
        read_only_fields = ['added_at']

class CompanySerializer(serializers.ModelSerializer):
    admins = CompanyAdminSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = ['id', 'name', 'description', 'logo', 'website', 'location', 'industry', 'employee_count', 'founded_date', 'created_at', 'admins']
        read_only_fields = ['created_at', 'admins']