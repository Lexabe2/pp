from rest_framework import viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
import random
from telegram import Bot
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import asyncio

BOT_TOKEN = "8367247978:AAE1cPfVbxBQF5nxcnJTzQL3ZpI2LIJjO3E"

# Хранилище одноразовых кодов (в продакшене лучше база)
codes_storage = {}  # {user_id: code}


def send_telegram_code(chat_id: int, text: str):
    """Синхронная обёртка для асинхронного метода send_message"""

    async def _send():
        bot = Bot(BOT_TOKEN)
        await bot.send_message(chat_id=chat_id, text=text)

    asyncio.run(_send())


@api_view(['POST'])
@permission_classes([AllowAny])
def login_send_code(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "Неверный логин или пароль"}, status=400)

    if not hasattr(user, "profile") or not user.profile.telegram_id:
        return Response({"error": "Нет Telegram ID у пользователя"}, status=400)

    code = str(random.randint(100000, 999999))
    codes_storage[user.id] = code

    # Отправка кода через синхронную обёртку
    send_telegram_code(int(user.profile.telegram_id), f"Ваш код: {code}")

    return Response({"message": "Код отправлен"})


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_telegram_code(request):
    username = request.data.get("username")
    code = request.data.get("code")

    if not username or not code:
        return Response({"error": "username и code обязательны"}, status=400)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "Пользователь не найден"}, status=404)

    stored_code = codes_storage.get(user.id)
    if stored_code != code:
        return Response({"error": "Неверный код"}, status=400)

    # Удаляем код после использования
    del codes_storage[user.id]

    # Генерируем токен DRF
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key})


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().select_related('profile')
    serializer_class = UserSerializer