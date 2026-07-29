from django.db import models


class Category(models.Model):
    title = models.CharField(max_length=100, verbose_name="Категории")
    price = models.DecimalField(max_digits=10, decimal_places=0, default=0, verbose_name='Цена')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created']
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'


class Additionally(models.Model):
    title = models.CharField(max_length=100, verbose_name="Дополнительно")
    price = models.DecimalField(max_digits=10, decimal_places=0, default=0, verbose_name='Цена')
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created']
        verbose_name = 'Дополнительно'
        verbose_name_plural = verbose_name


class Product(models.Model):
    basic = models.ForeignKey('Category', on_delete=models.CASCADE, verbose_name='Основной', null=True)
    additionally = models.ManyToManyField('Additionally', verbose_name='Дополнительный', blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=0, default=0, verbose_name='Итоговая цена', null=True)
    created = models.DateTimeField(auto_now_add=True, null=True)
    updated = models.DateTimeField(auto_now=True, null=True)
    name = models.CharField(max_length=255, verbose_name='Имя', null=True)
    phone = models.CharField(max_length=15, verbose_name='Телефон', null=True)
    email = models.EmailField(verbose_name='E-mail', null=True)
    agree = models.BooleanField(default=False, verbose_name='Согласие на обработку')
    comment = models.TextField(verbose_name='Комментарий', null=True, blank=True)

    def __str__(self):
        return f"{self.basic.title if self.basic else 'Без категории'} - {self.name}"

    def get_additionally_list(self):
        """Возвращает список дополнительных услуг"""
        return ", ".join([item.title for item in self.additionally.all()])

    class Meta:
        ordering = ['-created']
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'