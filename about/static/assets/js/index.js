const swiper = new Swiper('.swiper', {
    direction: 'horizontal',
    loop: true,
    slidesPerView: 1,
    clickable: true,
    autoHeight: true,
    breakpoints: {
        460: {
            spaceBetween: 20,
        }
    },

    // If we need pagination
    pagination: {
        el: '.swiper-pagination',
    },

    // Navigation arrows
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

});

document.addEventListener('DOMContentLoaded', function () {
    // ===== ОБРАБОТЧИК ДЛЯ CHECKBOX (BASIC) С ЕДИНИЧНЫМ ВЫБОРОМ =====
    const basicCheckboxes = document.querySelectorAll('.calc-basic');

    // Функция для снятия всех checkbox в группе basic
    function uncheckAllBasic(exceptCheckbox) {
        basicCheckboxes.forEach(function (otherCheckbox) {
            if (otherCheckbox !== exceptCheckbox) {
                otherCheckbox.checked = false;
                const otherLabel = otherCheckbox.closest('.calc__form--block-label');
                if (otherLabel) {
                    otherLabel.classList.remove('active');
                }
            }
        });
    }

    // Функция обновления состояния label
    function updateBasicLabelState(checkbox) {
        const label = checkbox.closest('.calc__form--block-label');
        if (!label) return;

        if (checkbox.checked) {
            label.classList.add('active');
        } else {
            label.classList.remove('active');
        }
    }

    basicCheckboxes.forEach(function (checkbox) {
        const label = checkbox.closest('.calc__form--block-label');
        if (!label) return;

        // Обработчик изменения состояния checkbox (срабатывает при программном изменении)
        checkbox.addEventListener('change', function (e) {
            // Если этот checkbox отмечен
            if (this.checked) {
                // Снимаем все остальные checkbox в группе basic
                uncheckAllBasic(this);
                // Обновляем состояние текущего label
                updateBasicLabelState(this);
            } else {
                // Если сняли выделение, просто убираем active
                updateBasicLabelState(this);
            }

            // Пересчитываем цену
            calculateTotal();
        });

        // Обработчик клика по label (основной)
        label.addEventListener('click', function (e) {
            // Предотвращаем стандартное поведение label
            e.preventDefault();

            // Проверяем текущее состояние checkbox
            const isChecked = checkbox.checked;

            if (isChecked) {
                // Если checkbox уже отмечен - снимаем его
                checkbox.checked = false;
                // Убираем active класс у текущего label
                this.classList.remove('active');
            } else {
                // Если checkbox не отмечен - отмечаем его
                checkbox.checked = true;
                // Снимаем все остальные checkbox
                uncheckAllBasic(checkbox);
                // Добавляем active класс текущему label
                this.classList.add('active');
            }

            // Пересчитываем цену
            calculateTotal();
        });

        // Инициализация при загрузке
        updateBasicLabelState(checkbox);
    });

    // ===== ОБРАБОТЧИК ДЛЯ CHECKBOX (ДОПОЛНИТЕЛЬНО) =====
    const additionalLabels = document.querySelectorAll('.calc__form-add-choice-label');
    additionalLabels.forEach(label => {
        const checkbox = label.querySelector('.calc-additional');
        if (checkbox) {
            function updateAdditionalState() {
                if (checkbox.checked) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            }

            // Обработчик изменения состояния
            checkbox.addEventListener('change', function (e) {
                updateAdditionalState();
                calculateTotal();
            });

            // Обработчик клика по label
            label.addEventListener('click', function (e) {
                // Предотвращаем стандартное поведение label
                e.preventDefault();

                // Переключаем состояние checkbox
                checkbox.checked = !checkbox.checked;

                // Обновляем состояние label
                if (checkbox.checked) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }

                // Пересчитываем цену
                calculateTotal();
            });

            // Инициализация
            updateAdditionalState();
        }
    });

    // ===== КАЛЬКУЛЯТОР СТОИМОСТИ =====
    const basicInputs = document.querySelectorAll('.calc-basic');
    const additionalInputs = document.querySelectorAll('.calc-additional');
    const totalPriceElement = document.getElementById('totalPrice');

    // Функция для расчета стоимости через API
    function calculateTotal() {
        let basicId = null;
        let additionallyIds = [];

        basicInputs.forEach(input => {
            if (input.checked) {
                basicId = input.value;
            }
        });

        additionalInputs.forEach(input => {
            if (input.checked) {
                additionallyIds.push(input.value);
            }
        });

        // Убираем условие if (!basicId) { ... return; }
        // Всегда отправляем запрос
        fetch('/api/calculate-price/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                basic_id: basicId,      // может быть null
                additionally_ids: additionallyIds
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    totalPriceElement.textContent = data.formatted_price;
                } else {
                    console.error('Ошибка расчета:', data.error);
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    }

    // Функция для получения CSRF токена
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Инициализируем расчет при загрузке
    calculateTotal();

    // ===== МОДАЛЬНОЕ ОКНО =====
    const modalBtn = document.querySelector('.calc__form-modal-btn');
    const modal = document.querySelector('.calc__form-modal');
    const modalClose = document.querySelector('.calc__form-modal-svg');
    const overlay = document.querySelector('.calc__form-modal-overlay');
    const submitBtn = document.getElementById('submitOrder');
    const form = document.getElementById('calculatorForm');
    const formErrors = document.getElementById('formErrors');

    // Создаем элемент для ошибки выбора типа сайта (вместо alert)
    const errorMessage = document.createElement('p');
    errorMessage.className = 'calc__form-error';
    errorMessage.style.cssText = `
        color: #ff6b6b;
        font-size: 14px;
        margin-top: 10px;
        margin-bottom: 0;
        text-align: center;
        display: none;
        padding: 10px;
        background: rgba(255, 107, 107, 0.1);
        border-radius: 8px;
        border: 1px solid #ff6b6b;
    `;
    errorMessage.textContent = '⚠️ Пожалуйста, выберите тип сайта';

    const formBlock = document.querySelector('.calc__form--block');
    if (formBlock) {
        formBlock.parentNode.insertBefore(errorMessage, formBlock.nextSibling);
    }

    // Функция для показа уведомления (тост)
    function showToast(message, type = 'error') {
        // Удаляем существующий тост
        const existingToast = document.querySelector('.calc__toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'calc__toast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff6b6b' : '#51cf66'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            font-size: 16px;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        toast.innerHTML = `
            <span style="font-size: 20px;">${type === 'error' ? '⚠️' : '✅'}</span>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Автоматическое скрытие через 3 секунды
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Добавляем стили для анимаций
    if (!document.querySelector('#toastStyles')) {
        const style = document.createElement('style');
        style.id = 'toastStyles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(style);
    }

    // Функция открытия модалки
    function openModal() {
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Очищаем ошибки при открытии
        formErrors.style.display = 'none';
        formErrors.textContent = '';
        // Скрываем ошибку выбора типа сайта
        errorMessage.style.display = 'none';
        // Убираем подсветку блока
        if (formBlock) {
            formBlock.style.border = 'none';
            formBlock.style.padding = '0';
        }
    }

    // Функция закрытия модалки
    function closeModal() {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        // Скрываем ошибку при закрытии
        errorMessage.style.display = 'none';
        // Убираем подсветку блока
        if (formBlock) {
            formBlock.style.border = 'none';
            formBlock.style.padding = '0';
        }
    }

    // Открытие по клику на кнопку
    if (modalBtn) {
        modalBtn.addEventListener('click', function () {
            // Убираем проверку на basicSelected
            openModal();
        });
    }

    // Закрытие по клику на крестик
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Закрытие по клику на оверлей
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    // Закрытие по клавише ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // ===== ОТПРАВКА ФОРМЫ =====
    if (submitBtn) {
        submitBtn.addEventListener('click', function (e) {
            e.preventDefault();

            const name = document.getElementById('id_name').value.trim();
            const phone = document.getElementById('id_phone').value.trim();
            const email = document.getElementById('id_email').value.trim();
            const agree = document.getElementById('id_agree').checked;
            const comment = document.getElementById('id_comment').value.trim();

            let errors = [];
            if (!name) errors.push('Пожалуйста, укажите ваше имя');
            if (!phone) errors.push('Пожалуйста, укажите ваш телефон');
            if (!email) errors.push('Пожалуйста, укажите ваш email');
            if (!agree) errors.push('Необходимо согласие на обработку персональных данных');

            // Проверку на basicId убираем

            if (errors.length > 0) {
                formErrors.style.display = 'block';
                formErrors.style.color = '#ff6b6b';
                formErrors.style.fontSize = '14px';
                formErrors.style.padding = '10px';
                formErrors.style.background = 'rgba(255, 107, 107, 0.1)';
                formErrors.style.borderRadius = '8px';
                formErrors.style.border = '1px solid #ff6b6b';
                formErrors.innerHTML = errors.join('<br>');
                formErrors.scrollIntoView({behavior: 'smooth', block: 'center'});
                return;
            }

            let basicId = null;
            basicInputs.forEach(input => {
                if (input.checked) basicId = input.value;
            });

            let additionallyIds = [];
            additionalInputs.forEach(input => {
                if (input.checked) additionallyIds.push(input.value);
            });

            const formData = new FormData();
            // Добавляем basic только если он выбран
            if (basicId) {
                formData.append('basic', basicId);
            }
            additionallyIds.forEach(id => {
                formData.append('additionally', id);
            });
            formData.append('name', name);
            formData.append('phone', phone);
            formData.append('email', email);
            formData.append('agree', agree ? 'on' : 'off');
            formData.append('comment', comment);
            formData.append('csrfmiddlewaretoken', getCookie('csrftoken'));

            // Отправляем данные на сервер
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

            fetch('/api/submit-order/', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Показываем успешное сообщение
                        showToast('Заявка успешно отправлена!', 'success');
                        closeModal();

                        // Сбрасываем форму
                        document.querySelectorAll('.calc-basic, .calc-additional').forEach(input => {
                            if (input.type === 'checkbox') {
                                input.checked = false;
                            }
                        });

                        // Обновляем цену
                        calculateTotal();

                        // Убираем активные классы
                        document.querySelectorAll('.calc__form--block-label, .calc__form-add-choice-label').forEach(label => {
                            label.classList.remove('active');
                        });

                        // Очищаем поля
                        const nameField = document.getElementById('id_name');
                        const phoneField = document.getElementById('id_phone');
                        const emailField = document.getElementById('id_email');
                        const commentField = document.getElementById('id_comment');
                        const agreeCheck = document.getElementById('id_agree');

                        if (nameField) nameField.value = '';
                        if (phoneField) phoneField.value = '';
                        if (emailField) emailField.value = '';
                        if (commentField) commentField.value = '';
                        if (agreeCheck) agreeCheck.checked = false;

                        // Скрываем ошибки
                        formErrors.style.display = 'none';
                        formErrors.textContent = '';
                    } else {
                        if (data.errors) {
                            const errorMessages = Object.values(data.errors).join('<br>');
                            formErrors.style.display = 'block';
                            formErrors.style.color = '#ff6b6b';
                            formErrors.style.fontSize = '14px';
                            formErrors.style.padding = '10px';
                            formErrors.style.background = 'rgba(255, 107, 107, 0.1)';
                            formErrors.style.borderRadius = '8px';
                            formErrors.style.border = '1px solid #ff6b6b';
                            formErrors.innerHTML = errorMessages;
                        } else {
                            showToast('Произошла ошибка при отправке. Попробуйте еще раз.', 'error');
                        }
                    }
                })
                .catch(error => {
                    console.error('Ошибка:', error);
                    showToast('Произошла ошибка при отправке. Попробуйте еще раз.', 'error');
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Отправить заявку';
                });
        });
    }

    // ===== ВАЛИДАЦИЯ НОМЕРА ТЕЛЕФОНА =====
    const phoneInput = document.getElementById('id_phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            // Удаляем все не цифры
            this.value = this.value.replace(/[^\d+]/g, '');

            // Если начинается с 8 или 9, добавляем +7
            if (this.value.length > 0 && !this.value.startsWith('+')) {
                if (this.value.startsWith('8')) {
                    this.value = '+7' + this.value.substring(1);
                } else if (this.value.startsWith('9')) {
                    this.value = '+7' + this.value;
                }
            }
        });
    }

    // ===== ВАЛИДАЦИЯ EMAIL =====
    const emailInput = document.getElementById('id_email');
    if (emailInput) {
        emailInput.addEventListener('blur', function () {
            const email = this.value.trim();
            if (email && !email.includes('@')) {
                this.style.borderColor = '#ff6b6b';
                setTimeout(() => {
                    this.style.borderColor = '';
                }, 2000);
            }
        });
    }

    console.log('Калькулятор и форма заявки успешно загружены!');
});

const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const message = document.getElementById('message');

burger.addEventListener('click', function () {
    // Переключаем класс active для бургера (крестик)
    this.classList.toggle('active');

    // Переключаем класс active для навигации
    nav.classList.toggle('active');
    message.classList.toggle('active');
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Закрыть мобильное меню при клике на ссылку
        const burger = document.getElementById('burger');
        const nav = document.getElementById('nav');
        const message = document.getElementById('message');
        if (burger) burger.classList.remove('active');
        if (nav) nav.classList.remove('active');
        if (message) message.classList.remove('active');

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});