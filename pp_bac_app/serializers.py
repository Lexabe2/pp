# pp_bac_app/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    telegram_id = serializers.CharField(
        source='profile.telegram_id',
        allow_blank=True, allow_null=True, required=False
    )
    role = serializers.CharField(
        source='profile.role',
        required=False
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'email',
            'telegram_id', 'role', 'first_name', 'last_name'
        ]

    def _get_or_create_profile(self, user):
        """Возвращает профиль пользователя, создавая его при необходимости."""
        profile, _ = UserProfile.objects.get_or_create(user=user)
        return profile

    def to_representation(self, instance):
        """При любом GET гарантируем, что профиль есть."""
        self._get_or_create_profile(instance)
        return super().to_representation(instance)

    def create(self, validated_data):
        # достаём данные профиля (DRF соберёт их в dict 'profile' из плоских полей telegram_id, role)
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password')

        # создаём пользователя с хэшированным паролем
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # создаём профиль
        UserProfile.objects.create(user=user, **profile_data)

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        profile = self._get_or_create_profile(instance)
        profile.telegram_id = profile_data.get('telegram_id', profile.telegram_id)
        profile.role = profile_data.get('role', profile.role)
        profile.save()

        return instance
