"use strict";

/* jslint browser */


document.addEventListener("DOMContentLoaded", () => {
    // Общие переменные
    const cart = [];
    const selectedColors = {}; // Хранение выбранных цветов для каждого товара
    const deliveryInputs = ["street", "house", "entrance", "floor", "apartment"];
    const decorOptions = document.querySelectorAll(".decor-option");
    
    // Найти элементы кнопок
    const makeOrderButton = document.getElementById("make-order");
    const goToDeliveryButton = document.getElementById("go-to-delivery");
    const readReviewsButton = document.getElementById("read-reviews");
    // Элементы страницы
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const searchResults = document.getElementById("search-results");
    const resultsContainer = document.getElementById("results-container");
     // Получаем все элементы, которые нужно искать
    const searchableItems = document.querySelectorAll(".flower-item");
    const storeName = document.querySelector(".store-name");
    const tagline = document.querySelector(".tagline");
    const tabButtons = document.querySelectorAll('.tab-link');
    const orderLink = document.getElementById("order-link");
    const mainMenuLink = document.getElementById("main-menu-link");
    // Проверяем состояние пользователя из localStorage
    let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    const accountButton = document.querySelector(".account");
    const accountModal = document.getElementById("account-modal");
    const closeAccountButton = document.getElementById("close-account");

    const loginContent = document.getElementById("login-content");
    const accountContent = document.getElementById("account-content");
    const userNameSpan = document.getElementById("user-name");
    const userPhoneSpan = document.getElementById("user-phone");
    const form = document.getElementById("login-form");
    const phoneInput = document.getElementById("phone");
    const phoneError = document.getElementById("phone-error");
    const logoutLink = document.getElementById("logout-link");
    
    // Получаем элементы корзины и модального окна корзины
    const cartButton = document.getElementById("open-cart");
    const cartModal = document.getElementById("cart-modal");
    const closeCartButton = document.getElementById("close-cart");
    
    const cartCount = document.getElementById("cart-count");
    const cartItems = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");
    const deliveryCostElement = document.getElementById("delivery-cost");
    const authWarning = document.getElementById("auth-warning");
    const placeOrderButton = document.getElementById("place-order");
    const clearCartButton = document.getElementById("clear-cart");
    const tabs = document.querySelectorAll("#cart-modal .tab-button");
    const tabContents = document.querySelectorAll("#cart-modal .tab-content");

    let deliveryCost = 0;
    
    // --- Функции ---
     // Функция для очистки контейнера результатов
    function clearResults() {
        resultsContainer.innerHTML = "";
        searchResults.style.display = "none";
    }

    // Функция для отображения результатов поиска
    function displayResults(results) {
        clearResults();

        if (results.length === 0) {
            resultsContainer.innerHTML = "<p>Ничего не найдено.</p>";
        } else {
            results.forEach(item => {
                resultsContainer.appendChild(item.cloneNode(true));
            });
        }

        searchResults.style.display = "block";
    }
    // Функция для переключения секций
    function showSection(sectionId) {
        const sections = document.querySelectorAll('.tab-content');
        sections.forEach((section) => {
            section.classList.remove('active'); // Скрыть все секции
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active'); // Показать выбранную секцию
            targetSection.scrollIntoView({ behavior: "smooth" }); // Плавный переход
        }
    }
    // Функция для переключения вкладок
    function openTab(event, tabId) {
        // Скрыть все секции
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach((content) => {
            content.classList.remove('active'); // Убираем класс active
        });

        // Убрать активный класс у всех кнопок
        const tabLinks = document.querySelectorAll('.tab-link');
        tabLinks.forEach((link) => link.classList.remove('active'));

        // Показать выбранную секцию
        const activeTab = document.getElementById(tabId);
        if (activeTab) {
            activeTab.classList.add('active'); // Добавляем класс active выбранной секции
        }

        // Добавить активный класс на текущую кнопку (если есть событие)
        if (event) {
            event.currentTarget.classList.add('active');
        }
    }
    // Функция для отображения содержимого профиля
    function showAccountContent() {
        loginContent.style.display = "none";
        accountContent.style.display = "block";

        // Получаем данные из localStorage
        const userName = localStorage.getItem("userName") || "Неизвестный пользователь";
        const userPhone = localStorage.getItem("userPhone") || "Не указан номер телефона";

        // Обновляем информацию в профиле
        userNameSpan.textContent = userName;
        userPhoneSpan.textContent = userPhone;
    }

    // Функция для отображения формы входа
    function showLoginContent() {
        loginContent.style.display = "block";
        accountContent.style.display = "none";
    }

    // Проверка состояния авторизации при загрузке страницы
    if (isLoggedIn) {
        showAccountContent();
    } else {
        showLoginContent();
    }
    
    // Сброс ошибки
    function resetError() {
        authWarning.style.display = "none";
        authWarning.textContent = "";
    }

    // Обновление отображения корзины
    function updateCartDisplay() {
        cartItems.innerHTML = "";
        let total = 0;

        cart.forEach(item => {
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = `
                <h4>${item.name} (${item.color})</h4>
                <p>${item.quantity} x ${item.price} руб</p>
                <p>Итого: ${item.quantity * item.price} руб</p>
            `;
            cartItems.appendChild(cartItem);
            total += item.quantity * item.price;
        });

        // Учитываем стоимость украшений
        decorOptions.forEach(option => {
            if (option.checked) {
                total += parseInt(option.dataset.price);
            }
        });

        totalPriceElement.textContent = `Общая сумма: ${total} руб`;
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Обновление стоимости доставки
    function updateDeliveryCost() {
        const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (document.querySelector("#delivery-tab.active")) {
            deliveryCost = cartTotal < 50 ? 5 : 0;
            deliveryCostElement.textContent = `Стоимость доставки: ${deliveryCost} руб`;
        } else {
            deliveryCost = 0;
            deliveryCostElement.textContent = "Самовывоз: бесплатно";
        }

        updateCartDisplay();
    }

    // Очистка корзины
    function clearCart() {
        cart.length = 0;
        decorOptions.forEach(option => (option.checked = false));
        updateCartDisplay();
    }

    // Проверка формы доставки
    function validateDeliveryMethod() {
        const pickupTabActive = document.querySelector("#pickup-tab.active");
        const deliveryTabActive = document.querySelector("#delivery-tab.active");

        if (!pickupTabActive && !deliveryTabActive) {
            authWarning.textContent = "Выберите способ получения: самовывоз или доставка.";
            authWarning.style.display = "block";
            return false;
        }

        if (deliveryTabActive) {
            for (const inputId of deliveryInputs) {
                const input = document.getElementById(inputId);
                if (!input.value.trim()) {
                    authWarning.textContent = "Заполните все поля для доставки.";
                    authWarning.style.display = "block";
                    return false;
                }
            }
        }

        return true;
    }
        function updateTotalCost() {
            const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const total = cartTotal + deliveryCost;
            totalPriceElement.textContent = `Общая сумма: ${total} руб`;
        }
    
    // --- Обработчики ---
    // Обработчики для кнопок
    document.getElementById("make-order").addEventListener("click", () => {
        showSection("bouquets");
    });

    document.getElementById("go-to-delivery").addEventListener("click", () => {
        showSection("contact");
    });

    document.getElementById("read-reviews").addEventListener("click", () => {
        showSection("reviews");
    });
    
    // Обработчик клика на кнопку поиска
    searchButton.addEventListener("click", function () {
        const query = searchInput.value.trim().toLowerCase();

        if (!query) {
            alert("Введите запрос для поиска.");
            return;
        }

        // Находим элементы, которые соответствуют запросу
        const results = Array.from(searchableItems).filter(item => {
            const name = item.querySelector("h3").textContent.toLowerCase();
            const description = item.textContent.toLowerCase();
            return name.includes(query) || description.includes(query);
        });

        // Отображаем результаты
        displayResults(results);
    });

    // Обработчик ввода текста в строку поиска
    searchInput.addEventListener("input", function () {
        const query = searchInput.value.trim();
        if (!query) {
            clearResults(); // Очищаем результаты, если строка поиска пустая
        }
    });
    
    // Изначально показываем только главную секцию
    openTab(null, "hero");
    storeName.addEventListener("click", () => openTab(null, "hero"));
    tagline.addEventListener("click", () => openTab(null, "hero"));

    // Добавить обработчики для всех кнопок вкладок
    tabButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            const tabId = button.getAttribute("data-tab");
            openTab(event, tabId);
        });
    });
    // Открытие модального окна аккаунта
    accountButton.addEventListener("click", (e) => {
        e.preventDefault();
        accountModal.style.display = "flex";

        if (isLoggedIn) {
            showAccountContent();
        } else {
            showLoginContent();
        }
    });

    // Закрытие модального окна
    closeAccountButton.addEventListener("click", () => {
        accountModal.style.display = "none";
    });

    // Обработка формы входа
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Предотвращаем отправку формы

        const phoneValue = phoneInput.value;
        const phoneDigits = phoneValue.replace(/\D/g, ''); // Убираем все символы кроме цифр

        if (phoneDigits.length !== 12) {
            phoneError.style.display = "inline"; // Показываем сообщение об ошибке
        } else {
            phoneError.style.display = "none"; // Скрываем сообщение об ошибке

            // Сохраняем данные пользователя
            const userName = document.getElementById("username").value;
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userName", userName);
            localStorage.setItem("userPhone", phoneValue);

            // Переходим к отображению профиля
            showAccountContent();
            isLoggedIn = true;
        }
    });

    // Обработка выхода из аккаунта
    logoutLink.addEventListener("click", function () {
        isLoggedIn = false;

        // Удаляем данные из localStorage
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhone");

        // Показываем форму входа
        showLoginContent();
    });

    // Закрытие модального окна при клике вне его содержимого
    window.addEventListener("click", function (event) {
        if (event.target === accountModal) {
            accountModal.style.display = "none";
        }
    });

    // Обработчик для "Перейти к выбору"
    orderLink.addEventListener("click", function (event) {
        event.preventDefault(); // Отключить переход по ссылке
        openTab(null, "flowers"); // Перейти на секцию "Цветы"
    });

    // Обработчик для "Перейти в главное меню"
    mainMenuLink.addEventListener("click", function (event) {
        event.preventDefault(); // Отключить переход по ссылке
        openTab(null, "hero"); // Перейти на главную секцию
    });
    
    // Открытие модального окна корзины
    cartButton.addEventListener("click", (e) => {
        e.preventDefault(); // Отключаем переход по ссылке
        cartModal.style.display = "flex";
    });

    // Закрытие модального окна корзины
    closeCartButton.addEventListener("click", () => {
        cartModal.style.display = "none";
    });


    // Закрытие модальных окон при клике вне их содержимого
    window.addEventListener("click", (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = "none";
        }
    });
    
    // Переключение вкладок
    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(tc => tc.classList.remove("active"));

            this.classList.add("active");
            document.getElementById(this.getAttribute("data-tab")).classList.add("active");

            updateDeliveryCost();
        });
    });
    // Обработка выбора цвета
    document.querySelectorAll('.color-circle').forEach(button => {
        button.addEventListener('click', function () {
            const parent = this.closest('.flower-item');
            const image = parent.querySelector('.flower-image');
            const colorId = this.getAttribute('data-color-id');
            const newImage = this.getAttribute('data-image');

            // Обновление изображения
            image.src = newImage;

            // Сохранение выбранного цвета
            const flowerName = parent.querySelector('h3').textContent;
            selectedColors[flowerName] = colorId;

            // Отображение активного цвета
            parent.querySelectorAll('.color-circle').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Увеличение и уменьшение количества
    document.addEventListener('click', function (e) {
        // Проверяем, что клик был по кнопке "+"
        if (e.target.classList.contains('increase')) {
            const control = e.target.closest('.cart-controls');
            if (control) {
                const quantitySpan = control.querySelector('.quantity');
                let quantity = parseInt(quantitySpan.textContent, 10);
                quantity++;
                quantitySpan.textContent = quantity;
            }
        }

        // Проверяем, что клик был по кнопке "-"
        if (e.target.classList.contains('decrease')) {
            const control = e.target.closest('.cart-controls');
            if (control) {
                const quantitySpan = control.querySelector('.quantity');
                let quantity = parseInt(quantitySpan.textContent, 10);
                if (quantity > 0) {
                    quantity--;
                }
                quantitySpan.textContent = quantity;
            }
        }
    });
    // Обновление корзины при изменении украшений
    decorOptions.forEach(option => {
        option.addEventListener("change", updateCartDisplay);
    });

    // Оформление заказа
    placeOrderButton.addEventListener("click", function () {
        resetError();
        if (validateDeliveryMethod()) {
            alert("Заказ успешно оформлен!");
            clearCart();
            cartModal.style.display = "none";
        }
    });

    // Очистка корзины
    clearCartButton.addEventListener("click", function () {
        clearCart();
        alert("Корзина очищена!");
    });

    // Добавление товара в корзину
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function () {
            const parent = this.closest(".flower-item");
            const name = parent.querySelector("h3").textContent;
            const price = parseInt(parent.querySelector(".price").textContent.match(/\d+/)[0]);
            const quantity = parseInt(parent.querySelector(".quantity").textContent);
            const color = selectedColors[name] || "Не выбран";

            if (quantity > 0) {
                const existingItem = cart.find(item => item.name === name && item.color === color);
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    cart.push({ name, price, quantity, color });
                }
                updateCartDisplay();
                updateDeliveryCost();

                alert("Товар добавлен в корзину!");
            }
        });
    });
    document.querySelectorAll('#delivery-method .tab-button').forEach(button => {
        button.addEventListener('click', function () {
            const parent = document.getElementById('delivery-method');
            const targetTab = parent.querySelector(`#${this.dataset.tab}`);

            parent.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            parent.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

            targetTab.classList.add('active');
            this.classList.add('active');
        });
    });
    // Инициализация
    updateCartDisplay();
    updateDeliveryCost();
});




