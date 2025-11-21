from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (JobCategoryViewSet, SkillViewSet, 
                    JobDetailView, JobListView, JobViewSet)

router = DefaultRouter()

router.register(r'categories', JobCategoryViewSet, basename='category')
router.register(r'skills', SkillViewSet, basename='skill')

urlpatterns = [
    path('', include(router.urls)),
]

# Router for ViewSets
router = DefaultRouter()
router.register(r'categories', JobCategoryViewSet, basename='category')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'listings', JobViewSet, basename='job')

app_name = 'jobs'

urlpatterns = [
    # ViewSet routes
    path('', include(router.urls)),
    
    # Custom search endpoint with advanced filtering
    #path('search/', JobSearchView.as_view(), name='job_search'),
    
    # Statistics endpoints
    #path('statistics/', JobStatisticsView.as_view(), name='job_statistics'),
    #path('statistics/dashboard/', JobStatisticsView.as_view({'get': 'dashboard'}), name='job_dashboard'),
    
    
    # Bulk operations (admin/employer only)
    #path('bulk-action/', BulkJobActionView.as_view(), name='bulk_job_action'),
    
    # Export endpoints
    #path('export/', ExportJobsView.as_view(), name='export_jobs'),
    #path('applications/export/', ExportApplicationsView.as_view(), name='export_applications'),
    
    # Job-specific endpoints
    path('listings/<int:pk>/apply/', JobViewSet.as_view({'post': 'apply'}), name='job_apply'),
    path('listings/<int:pk>/bookmark/', JobViewSet.as_view({'post': 'bookmark'}), name='job_bookmark'),
    path('listings/<int:pk>/similar/', JobViewSet.as_view({'get': 'similar'}), name='similar_jobs'),
    path('listings/<int:pk>/applications/', JobViewSet.as_view({'get': 'applications'}), name='job_applications'),
    
    # Category-specific endpoints
    path('categories/<slug:slug>/jobs/', JobCategoryViewSet.as_view({'get': 'jobs'}), name='category_jobs'),
    path('categories/popular/', JobCategoryViewSet.as_view({'get': 'popular'}), name='popular_categories'),
    
    # My jobs/applications endpoints
    path('my-jobs/', JobViewSet.as_view({'get': 'my_jobs'}), name='my_jobs'),
    #path('my-applications/', ApplicationViewSet.as_view({'get': 'my_applications'}), name='my_applications'),
]