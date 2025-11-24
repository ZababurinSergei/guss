```markdown
# The Last of Guss - Monorepo

Монопольное приложение для игры в кликер с системой раундов и рейтингами.

## Структура проекта

Проект организован как монорепозиторий с использованием workspace:

- `packages/backend` - Backend сервер на Fastify
- `packages/database` - Модели и конфигурация базы данных
- `packages/frontend` - Frontend приложение на веб-компонентах

## Предварительные требования

- Node.js (версия 18+)
- PostgreSQL
- Redis (опционально, для очереди тапов)

## Установка

```bash
# Установка зависимостей
npm install
```

## Настройка окружения

Создайте файл `.env` в корне проекта:

```env
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=the_last_of_guss
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Сервер
PORT=3019
NODE_ENV=development
CORS_ORIGIN=http://localhost:3012

# Redis (опционально)
REDIS_URL=redis://localhost:6379
USE_TAP_QUEUE=false

# Настройки раундов
ROUND_DURATION=60
COOLDOWN_DURATION=30
MAX_TAPS_PER_SECOND=10
TAP_COOLDOWN_MS=50
```

## Запуск проекта

### Полный цикл запуска

```bash
# Очистка базы данных и сборка
npm run db:drop
npm run db:create
npm run db:clear
npm run database:clean

# Миграции
npm run migrate:up

# Сборка всех пакетов
npm run build:database
npm run build:backend
npm run build:frontend

# Запуск серверов
npm run backend:start
npm run proxy
```

### Отдельные команды

#### Управление базой данных
```bash
# Удаление базы данных
npm run db:drop

# Создание базы данных
npm run db:create

# Очистка базы данных
npm run db:clear

# Очистка dist директории database пакета
npm run database:clean
```

#### Миграции
```bash
# Применение миграций
npm run migrate:up
```

#### Сборка
```bash
# Сборка database пакета
npm run build:database

# Сборка backend пакета
npm run build:backend

# Сборка frontend пакета
npm run build:frontend
```

#### Запуск серверов
```bash
# Запуск backend сервера
npm run backend:start

# Запуск proxy сервера
npm run proxy
```

## Структура базы данных

Проект использует PostgreSQL с следующими основными таблицами:

- `users` - Пользователи системы
- `rounds` - Раунды игры
- `participants` - Участие пользователей в раундах

## API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход из системы
- `GET /api/auth/me` - Получение профиля пользователя

### Раунды
- `GET /api/rounds` - Получение списка раундов
- `GET /api/rounds/:id` - Получение информации о раунде
- `POST /api/rounds` - Создание нового раунда (требует админских прав)

### Тапы (клики)
- `POST /api/rounds/:roundId/tap` - Совершение тапа в раунде
- `GET /api/tap/status/:taskId` - Проверка статуса тапа (при использовании очереди)

## Особенности системы

### Механика тапов
- Каждый 11-й тап дает 10 очков вместо 1
- Система ограничения скорости (rate limiting)
- Поддержка атомарных операций для избежания гонок
- Опциональная очередь тапов через Redis

### Статусы раундов
- `cooldown` - Ожидание начала
- `active` - Активный раунд
- `finished` - Завершенный раунд

### Роли пользователей
- `user` - Обычный пользователь
- `admin` - Администратор (может создавать раунды)
- `nikita` - Специальная роль (тапы не засчитываются)

## Разработка

### Структура фронтенда
Фронтенд построен на кастомных веб-компонентах с использованием:
- `BaseComponent` - Базовый класс для всех компонентов
- Система состояний и маршрутизации
- CSS-переменные для темной/светлой темы

### Основные компоненты
- `navigation-manager` - Управление навигацией
- `login-page` - Страница входа
- `rounds-list` - Список раундов
- `round-page` - Страница раунда
- `api-service` - Сервис для работы с API

## Производственная сборка

```bash
NODE_ENV=production npm run build:frontend
NODE_ENV=production npm run build:backend
```

## Примечания

- Проект использует TypeScript для type safety
- База данных настраивается через миграции Sequelize
- Frontend собирается через Vite с поддержкой горячей перезагрузки
- Backend сервер также отдает статические файлы фронтенда