from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, login_send_code, verify_telegram_code, MeView
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),  # маршруты UserViewSet
    path('api-token-auth/', obtain_auth_token),  # стандартный логин по токену
    path('auth/login-send-code/', login_send_code, name='login-send-code'),  # шаг 1: логин + пароль → код
    path('auth/verify-code/', verify_telegram_code, name='verify-code'),  # шаг 2: проверка кода → токен
    path('me/', MeView.as_view(), name='me'),
]
