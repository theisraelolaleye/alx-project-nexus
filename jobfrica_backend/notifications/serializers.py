from rest_framework import serializers
from .models import Notification
from users.serializers import UserProfileSerializer

class NotificationSerializer(serializers.ModelSerializer):
    recipient = UserProfileSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['id', 'title', 'message', 'notification_type', 'created_at', 'related_job', 'related_application']