FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY UI/dist ./UI/dist
COPY UI/server ./UI/server

ENV PORT=7860
EXPOSE 7860

CMD gunicorn app:app --bind 0.0.0.0:${PORT} --workers 2 --timeout 60
