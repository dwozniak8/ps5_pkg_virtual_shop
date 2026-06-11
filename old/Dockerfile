FROM python:3.12-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1 \
	APP_PORT=5000 \
	PKG_PATH_GAMES=/data/games \
	PKG_PATH_MEDIA=/data/media \
	PKG_PATH_APPS=/data/apps \
	PKG_PATH_TOOLS=/data/tools

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends tk \
	&& rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt \
	&& pip install --no-cache-dir customtkinter

COPY . .
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
