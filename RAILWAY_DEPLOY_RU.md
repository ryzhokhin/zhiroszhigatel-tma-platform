# Railway deploy checklist

## Почему упал билд

Railway был запущен из корня монорепозитория. В корне раньше не было команды
`start`, поэтому Railpack не понял, какой сервис запускать.

Теперь в корневом `package.json` есть:

```json
"start": "npm run backend:start"
```

Это позволит текущему root deploy поднять backend по умолчанию.

## Рекомендуемая схема

Лучше держать два отдельных Railway service в одном Railway project:

```text
backend service       apps/backend
telegram bot service  apps/telegram-bot
```

## Backend service

Railway settings:

```text
Root Directory: apps/backend
Start Command: npm start
```

Variables:

```text
MYSQL_URL=${{MySQL.MYSQL_URL}}
CORS_ORIGIN=https://your-netlify-site.netlify.app
```

После деплоя проверь:

```text
https://your-backend.up.railway.app/health
```

Ожидаемый ответ:

```json
{"status":"ok"}
```

## Telegram bot service

Railway settings:

```text
Root Directory: apps/telegram-bot
Start Command: npm start
```

Variables:

```text
BOT_TOKEN=your_botfather_token
WEB_APP_URL=https://your-netlify-site.netlify.app/
BACKEND_URL=https://your-backend.up.railway.app
```

Не добавляй публичный domain для bot service. Это не сайт, а background process.

Не запускай один и тот же Telegram bot token одновременно локально и на Railway.

## Если деплоишь из корня repo

Текущий root deploy теперь будет запускать backend.

Для bot service из корня нужно переопределить Start Command:

```text
npm run bot:start
```

Но вариант с Root Directory чище.
