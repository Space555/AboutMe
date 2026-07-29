from django.urls import path
from app_main.views import IndexView, submit_order, calculate_price


urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('api/calculate-price/', calculate_price, name='calculate_price'),
    path('api/submit-order/', submit_order, name='submit_order'),
]