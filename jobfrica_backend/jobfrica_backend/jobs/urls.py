from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobDetailView, JobListView, JobViewSet

router = DefaultRouter()

router.register(r'', JobViewSet, basename='job')

urlpatterns = [
    path('', include(router.urls)),
]