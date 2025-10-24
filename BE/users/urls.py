from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register, name='user-register'),
    path('login/', views.login, name='user-login'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', views.profile, name='user-profile'),
]
