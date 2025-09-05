from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import UserProfile, Flow, Atm, Operation


# ===== Пользователи с профилем =====
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)

    def telegram_id(self, obj):
        return obj.profile.telegram_id
    telegram_id.short_description = 'Telegram ID'

    def role(self, obj):
        return obj.profile.role
    role.short_description = 'Role'

    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'telegram_id', 'role')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', 'profile__role')
    search_fields = ('username', 'email', 'profile__telegram_id')


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


# ===== Operation =====
@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


# ===== Flow =====
@admin.register(Flow)
class FlowAdmin(admin.ModelAdmin):
    list_display = ('number', 'bank', 'start_date', 'end_date')
    search_fields = ('number', 'bank')


# ===== Atm =====
@admin.register(Atm)
class AtmAdmin(admin.ModelAdmin):
    list_display = ('sn', 'model', 'part', 'flow', 'data_start', 'data_end', 'date_invoice')
    list_filter = ('flow', 'model', 'part', 'operations')
    search_fields = ('sn', 'model', 'part')
    filter_horizontal = ('operations',)  # удобный виджет ManyToManyField для выбора операций