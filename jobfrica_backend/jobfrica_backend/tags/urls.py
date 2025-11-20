from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobCategoryViewSet, SkillViewSet

router = DefaultRouter()

router.register(r'categories', JobCategoryViewSet, basename='category')
router.register(r'skills', SkillViewSet, basename='skill')

urlpatterns = [
    path('', include(router.urls)),
]