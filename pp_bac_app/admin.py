from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)

    # Чтобы выводить роль и telegram_id в списке пользователей
    def telegram_id(self, obj):
        return obj.profile.telegram_id

    telegram_id.short_description = 'Telegram ID'

    def role(self, obj):
        return obj.profile.role

    role.short_description = 'Role'

    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'telegram_id', 'role')

    # Чтобы можно было фильтровать пользователей по ролям
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', 'profile__role')

    # Позволяет искать по Telegram ID
    search_fields = ('username', 'email', 'profile__telegram_id')


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
