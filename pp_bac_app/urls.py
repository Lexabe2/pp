from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import UserViewSet, login_send_code, verify_telegram_code, MeView, AtmViewSet, OperationViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'atms', AtmViewSet, basename='atm')
router.register(r'operations', OperationViewSet, basename='operation')

urlpatterns = [
    path('', include(router.urls)),
    path('api-token-auth/', obtain_auth_token),
    path('auth/login-send-code/', login_send_code),
    path('auth/verify-code/', verify_telegram_code),
    path('me/', MeView.as_view()),
]