# users/models.py
from django.contrib.auth.models import User
from django.db import models

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    telegram_id = models.CharField(max_length=50, blank=True, null=True)

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
        ('user', 'User'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return f"{self.user.username} Profile"


class Flow(models.Model):
    number = models.IntegerField(unique=True, verbose_name='Номер потока')
    bank = models.CharField(max_length=50, verbose_name='Банк')
    start_date = models.DateField(verbose_name='Дата заведения')
    end_date = models.DateField(verbose_name='Дата окончания', blank=True, null=True)

    def __str__(self):
        return f"Flow {self.number} - {self.bank}"

    class Meta:
        verbose_name = "Поток"  # название модели в единственном числе
        verbose_name_plural = "Потоки"


class Operation(models.Model):
    name = models.CharField(max_length=255, unique=True)
    duration_minutes = models.PositiveIntegerField(
        verbose_name="Время (минуты)",
        help_text="Сколько минут занимает выполнение работы",
        default=0
    )

    def __str__(self):
        return f"{self.name} ({self.duration_minutes} мин)"

    class Meta:
        verbose_name = "Работа"
        verbose_name_plural = "Работы"


class Atm(models.Model):
    sn = models.CharField(max_length=11, verbose_name="Серийный номер")
    model = models.CharField(max_length=11, verbose_name='Модель')
    part = models.CharField(max_length=11, verbose_name='Партийный номер')
    data_start = models.DateField(verbose_name='Дата начала ПП')
    data_end = models.DateField(verbose_name='Дата окончания ПП')
    date_invoice = models.DateField(verbose_name='Дата выставления счета')
    flow = models.ForeignKey(
        Flow,
        on_delete=models.CASCADE,
        related_name="atms"
    )
    operations = models.ManyToManyField(Operation, related_name="atms", blank=True)

    def __str__(self):
        return f"{self.sn} ({self.model})"

    class Meta:
        verbose_name = "Банкомат"  # название модели в единственном числе
        verbose_name_plural = "Банкоматы"