from django.contrib import admin
from django.urls import path
from pp_bac_app.views import hello

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/hello/", hello),
]
