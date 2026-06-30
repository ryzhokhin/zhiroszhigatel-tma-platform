# Zhiroszhigatel TMA Platform

This repository combines the current Telegram Mini App platform code into one
monorepo.

## Structure

```text
apps/backend       Express API for users, guides, meals, and trainings
apps/telegram-bot  Telegram bot that opens the Mini App and handles payments
apps/frontend      Reserved for the Mini App frontend source
```

The existing backend and bot code were copied from the original repositories
without nested `.git`, `.idea`, or `node_modules` folders.

## Local Setup

Install app dependencies:

```bash
npm run install:all
```

Start the backend:

```bash
npm run backend:start
```

Start the bot:

```bash
BOT_TOKEN=replace_with_botfather_token npm run bot:start
```

## Deployment Notes

Deploy `apps/backend` as a Railway Node service.

Deploy `apps/telegram-bot` as a separate Railway Node service.

Deploy `apps/frontend` to Netlify after the Mini App frontend source is added.

Telegram Mini Apps must use an HTTPS `WEB_APP_URL`.
