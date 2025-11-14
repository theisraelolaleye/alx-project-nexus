from django.shortcuts import render
from rest_framework import viewsets, generics, filters
from .models import Job
from core.permissions import IsAdminUser, IsEmployer, IsJobOwnerOrReadOnly
from .serializers import JobSerializer

# Create your views here.
class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'company__name', 'location']
    ordering_fields = ['posted_at', 'title']
    
    def get_permissions(self):
        if self.action in ['create']:
            permission_classes = [IsEmployer]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsJobOwnerOrReadOnly]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

class JobListView(generics.ListAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'company__name', 'location']
    ordering_fields = ['posted_at', 'title']
    permission_classes = []

class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsJobOwnerOrReadOnly]
