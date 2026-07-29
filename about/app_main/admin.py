from django.contrib import admin
from .models import Category, Additionally, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'price', 'created']
    list_editable = ['title', 'price']
    search_fields = ['title']
    list_filter = ['created']


@admin.register(Additionally)
class AdditionallyAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'price', 'created']
    list_editable = ['title', 'price']
    search_fields = ['title']
    list_filter = ['created']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'basic', 'get_additionally_list', 'total_price', 'name', 'phone', 'email', 'agree', 'created']
    list_display_links = ['id', 'basic']
    list_filter = ['basic', 'agree', 'created']
    search_fields = ['name', 'phone', 'email', 'basic__title']
    readonly_fields = ['total_price', 'created', 'updated']
    filter_horizontal = ['additionally']  # Удобный виджет для ManyToMany

    fieldsets = (
        ('Выбор услуг', {
            'fields': ('basic', 'additionally')
        }),
        ('Контактные данные', {
            'fields': ('name', 'phone', 'email', 'agree', 'comment')
        }),
        ('Информация о заявке', {
            'fields': ('total_price', 'created', 'updated')
        }),
    )

    def get_additionally_list(self, obj):
        return obj.get_additionally_list()
    get_additionally_list.short_description = 'Дополнительные услуги'