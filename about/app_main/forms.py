from django import forms
from app_main.models import *


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['basic', 'additionally', 'name', 'phone', 'email', 'agree', 'comment']
        widgets = {
            'basic': forms.Select(attrs={'class': 'calc__form-select'}),
            'additionally': forms.SelectMultiple(attrs={'class': 'calc__form-select-multiple'}),
            'name': forms.TextInput(attrs={'class': 'calc__form-modal-info-input', 'placeholder': 'Имя'}),
            'phone': forms.TextInput(attrs={'class': 'calc__form-modal-info-input', 'placeholder': 'Телефон'}),
            'email': forms.EmailInput(attrs={'class': 'calc__form-modal-info-input', 'placeholder': 'Почта'}),
            'agree': forms.CheckboxInput(attrs={'class': 'calc__form-modal-agree-input'}),
            'comment': forms.Textarea(attrs={'class': 'calc__form-modal-comment-textarea', 'cols': 50, 'rows': 7}),
        }