from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsCompanyAdmin(BasePermission):
    """
    Custom permission to only allow company admins to edit company details.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in SAFE_METHODS:
            return True

        # Write permissions are only allowed to the company admin.
        return obj.admins.filter(user=request.user).exists()

class IsJobSeeker(BasePermission):
    """
    Custom permission to only allow job seekers to access certain views.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'job_seeker'
    
class IsEmployer(BasePermission):
    """
    Custom permission to only allow employers to access certain views.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'employer'

class IsAdminUser(BasePermission):
    """
    Custom permission to only allow admin users to access certain views.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'
    
class IsJobOwnerOrReadOnly(BasePermission):
    """
    Allows access only to the user who is an admin of the company that posted the job.
    """
    def has_object_permission(self, request, view, obj):
        # Check if the user is an admin of the company associated with the job
        if not request.user or not request.user.is_authenticated:
            return False
        return obj.company.admins.filter(user=request.user).exists()

class IsApplicantOrCompanyAdmin(BasePermission):
    """
    - The applicant can view and delete (withdraw) their application.
    - The company admin can view and update the status of the application.
    """
    def has_object_permission(self, request, view, obj):
        is_applicant = obj.applicant == request.user
        is_company_admin = obj.job.company.admins.filter(user=request.user).exists()

        if request.method in SAFE_METHODS: # GET
            return is_applicant or is_company_admin
        if request.method == 'PUT' or request.method == 'PATCH': # Update status
            return is_company_admin
        if request.method == 'DELETE': # Withdraw
            return is_applicant
        
        return False