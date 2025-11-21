from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

# Create your views here.
class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notifications."""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter notifications to only show those relevant to the user."""
        user = self.request.user
        if not user.is_authenticated:
            return Notification.objects.none()
        return self.queryset.filter(recipient=user).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Endpoint to get unread notifications."""
        user = request.user
        unread_notifications = self.get_queryset().filter(read=False)
        serializer = self.get_serializer(unread_notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Endpoint to mark a notification as read."""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all of the user's unread notifications as read."""
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'all notifications marked as read'}, status=status.HTTP_200_OK)
    