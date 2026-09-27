# InsureFlow

InsureFlow — веб-платформа для автоматизации работы страхового брокера, разработанная на Laravel и React.

Система поддерживает роли Customer, Broker и Admin, публичный страховой калькулятор, управление заявками, документами и полисами, а также AI-модули для анализа страховых рисков и обработки данных.

## Основные возможности

* Публичный калькулятор страхования
* Регистрация и авторизация через Laravel Sanctum
* Роли Customer / Broker / Admin
* Создание и обработка страховых заявок
* Общий пул заявок для брокеров
* Управление документами и полисами
* Имитация оплаты
* AI Risk Analysis
* AI Smart Data Extraction
* Управление тарифами и типами страхования
* Административная статистика

## Технологии

**Backend**

* PHP
* Laravel
* MySQL
* Laravel Sanctum
* Composer

**Frontend**

* React
* Vite
* JavaScript
* Axios
* Tailwind CSS
* shadcn/ui

**AI**

* Groq API

## Требования

Перед запуском необходимо установить:

* PHP
* Composer
* MySQL
* Node.js (npm устанавливается вместе с Node.js)

## Быстрый запуск

Backend и frontend запускаются в двух отдельных терминалах.

### Backend

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Создайте пустую MySQL базу данных и настройте подключение в `backend/.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=insurance_broker
DB_USERNAME=root
DB_PASSWORD=
```

После этого выполните:

```bash
php artisan migrate --seed
php artisan serve
```

Backend по умолчанию будет доступен по адресу:

```text
http://127.0.0.1:8000
```

### Frontend

Во втором терминале:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend обычно будет доступен по адресу:

```text
http://localhost:5173
```

## Переменные окружения

Основные backend-переменные:

```dotenv
APP_NAME=InsureFlow
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=insurance_broker
DB_USERNAME=root
DB_PASSWORD=

GROQ_API_KEY=your_api_key
GROQ_MODEL=your_model
GROQ_API_URL=your_api_url
```

Не добавляйте реальные API-ключи, пароли и другие секреты в Git.

В текущей версии frontend использует API URL, указанный в:

```text
frontend/.env
```

## База данных

Структура базы данных создаётся через Laravel migrations.

Для создания таблиц и начальных данных используется:

```bash
php artisan migrate --seed
```

Отдельный SQL-файл для импорта структуры базы данных не требуется.

## Роли пользователей

### Customer

* рассчитывает стоимость страхования;
* создаёт и отслеживает свои заявки;
* работает со своими документами и полисами;
* загружает документы;
* оплачивает одобренные заявки.

### Broker

* просматривает общий пул заявок;
* принимает заявки в работу;
* работает со своими назначенными заявками;
* использует AI-анализ;
* одобряет или отклоняет заявки.

### Admin

* управляет пользователями;
* управляет типами страхования и тарифами;
* просматривает административную статистику.

## AI-модули

**AI Risk Analysis** анализирует данные заявки и формирует оценку риска, факторы и рекомендацию для брокера.

**Smart Data Extraction** извлекает структурированные данные из свободного текста клиента и сравнивает их с данными заявки.

AI используется как вспомогательный инструмент. Финальное решение по заявке принимает брокер.

## Безопасность

В проекте используются:

* Laravel Sanctum;
* Role Middleware;
* Laravel Policies;
* серверное разграничение доступа;
* защищённый доступ к заявкам и документам;
* ограничение AI-функций по ролям и принадлежности заявки.

## Запуск проверок

Laravel:

```bash
cd backend
php artisan test
```

Frontend build:

```bash
cd frontend
npm run build
```
