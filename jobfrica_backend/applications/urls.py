from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ApplicationViewSet,
)

# Router for ViewSets
router = DefaultRouter()
router.register(r'', ApplicationViewSet, basename='application')



urlpatterns = [
    # ViewSet routes
    path('', include(router.urls)),
    
    # Application management
    #path('applications/<int:pk>/status/', ApplicationStatusUpdateView.as_view(), name='update_application_status'),
    
    # My jobs/applications endpoints
    path('my-applications/', ApplicationViewSet.as_view({'get': 'my_applications'}), name='my_applications'),
]