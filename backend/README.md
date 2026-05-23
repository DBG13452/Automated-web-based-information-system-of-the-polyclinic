# Backend

Серверная часть проекта на FastAPI.

На текущем этапе подготовлены:

- конфигурация через `.env`
- подключение PostgreSQL
- SQLAlchemy Base, engine и session
- первые модели MVP
- заготовка миграций Alembic

## Запуск

1. Создать и активировать виртуальное окружение.
2. Установить зависимости из `requirements.txt`.
3. Создать файл `.env` по примеру `.env.example`.
4. Убедиться, что локальный PostgreSQL запущен и создана база `clinic_db`.
5. Применить миграции.
6. Запустить сервер:

```bash
alembic upgrade head
```

```bash
uvicorn app.main:app --reload
```

## Проверка

- `GET /health` — backend поднят
- `GET /health/db` — backend видит PostgreSQL
- `GET /docs` — Swagger UI

## Строка подключения по умолчанию

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/clinic_db
```
