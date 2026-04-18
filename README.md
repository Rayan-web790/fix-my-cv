---
title: FixMyCV
emoji: 🚀
colorFrom: indigo
colorTo: blue
sdk: docker
pinned: false
---

# FixMyCV - Modern Fullstack Deployment

This repository is optimized for deployment on **Hugging Face Spaces** using the **Docker SDK**.

## How to Deploy

1. **GitHub Sync**: Connect this repository to your Hugging Face Space.
2. **Space Settings**:
   - Ensure the SDK is set to **Docker**.
   - Add your environment variables in **Settings > Variables and secrets**.

## Configuration (Secrets Required)

Copy the values from your local `.env` to the Hugging Face Space secrets:

- `OPENAI_API_KEY`
- `GROQ_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT` (The entire JSON string)
- `ADMIN_EMAIL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

## Local Development

To run locally, you can still use the `start.bat` file or:

```bash
cd backend && npm install && node server.js
cd frontend && npm install && npm run dev
```

Developed with ❤️ for FixMyCV.
