FROM python:3.11-slim

# Рабочая директория
WORKDIR /app

# Оптимизация Python (без pyc и буферизации логов)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Копируем зависимости
COPY requirements.txt .

# Устанавливаем системные пакеты и Python-библиотеки
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 8080

# Запускаем приложение через uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
