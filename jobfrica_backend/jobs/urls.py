from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (JobCategoryViewSet, SkillViewSet, JobViewSet)
from applications.views import ApplicationViewSet


# Router for ViewSets
router = DefaultRouter()
router.register(r'categories', JobCategoryViewSet, basename='category')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'', JobViewSet, basename='jobs')

app_name = 'jobs'

urlpatterns = [
    # ViewSet routes
    path('', include(router.urls)),
    # Application endpoints
    path('my-applications/', ApplicationViewSet.as_view({'get': 'my_applications'}), name='my_applications'),
]
