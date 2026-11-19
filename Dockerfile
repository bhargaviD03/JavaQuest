# ==============================================================================
# JavaQuest — Unified Full-Stack Dockerfile
# Builds Frontend (React/Vite) & Packages with FastAPI + OpenJDK (Java Runtime)
# One Container Serves Both Frontend SPA and Backend API on Port 8000
# ==============================================================================

# STAGE 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# STAGE 2: Unified Backend + OpenJDK + Frontend Static Assets
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install OpenJDK (for live Java Cloud IDE execution) and database client tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-jdk-headless \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir email-validator "psycopg[binary]"

# Copy backend source code and seed datasets
COPY backend/ ./

# Copy compiled frontend distribution to both ./dist and ../frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 8000

CMD ["python", "main.py"]
