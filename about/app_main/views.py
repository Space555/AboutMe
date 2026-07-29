from django.shortcuts import render
from django.views.generic import TemplateView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Category, Additionally, Product
from .forms import ProductForm
import json


class IndexView(TemplateView):
    template_name = 'main/index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        context['additionally'] = Additionally.objects.all()
        context['form'] = ProductForm()
        return context


@csrf_exempt
@require_http_methods(["POST"])
def calculate_price(request):
    try:
        data = json.loads(request.body)
        total_price = 0
        basic_id = data.get('basic_id')
        additionally_ids = data.get('additionally_ids', [])

        # Если передан basic_id, добавляем его цену
        if basic_id:
            try:
                category = Category.objects.get(id=basic_id)
                total_price += int(category.price)
            except Category.DoesNotExist:
                pass

        # Добавляем цены дополнительных услуг
        if additionally_ids:
            additionally_list = Additionally.objects.filter(id__in=additionally_ids)
            for item in additionally_list:
                total_price += int(item.price)

        return JsonResponse({
            'success': True,
            'total_price': total_price,
            'formatted_price': f'{total_price:,} ₽'.replace(',', ' ')
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def submit_order(request):
    try:
        basic_id = request.POST.get('basic')
        additionally_ids = request.POST.getlist('additionally')
        name = request.POST.get('name')
        phone = request.POST.get('phone')
        email = request.POST.get('email')
        agree = request.POST.get('agree') == 'on'
        comment = request.POST.get('comment', '')

        # Проверяем только обязательные поля (basic теперь необязателен)
        errors = {}
        if not name:
            errors['name'] = 'Введите имя'
        if not phone:
            errors['phone'] = 'Введите телефон'
        if not email:
            errors['email'] = 'Введите email'
        if not agree:
            errors['agree'] = 'Необходимо согласие на обработку данных'

        if errors:
            return JsonResponse({
                'success': False,
                'errors': errors
            }, status=400)

        # Получаем объект Category, если указан basic_id
        basic = None
        total_price = 0
        if basic_id:
            try:
                basic = Category.objects.get(id=basic_id)
                total_price += int(basic.price)
            except Category.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'errors': {'basic': 'Выбранный тип сайта не существует'}
                }, status=400)

        # Создаём заявку
        product = Product.objects.create(
            basic=basic,              # может быть None
            total_price=total_price,  # пока без дополнительных
            name=name,
            phone=phone,
            email=email,
            agree=agree,
            comment=comment
        )

        # Добавляем дополнительные услуги и пересчитываем цену
        if additionally_ids:
            additionally_list = Additionally.objects.filter(id__in=additionally_ids)
            product.additionally.set(additionally_list)
            for item in additionally_list:
                total_price += int(item.price)
            product.total_price = total_price
            product.save()

        return JsonResponse({
            'success': True,
            'message': 'Заявка успешно отправлена!',
            'order_id': product.id
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)