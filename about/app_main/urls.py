from django.urls import path
from app_main.views import IndexView


urlpatterns = [
    path('', IndexView.as_view(), name='index'),
]