# Deployment Guide (Render.com)

This guide will help you deploy your Gemini Web App to **Render.com** (a popular, free-friendly cloud platform).

## 1. Prerequisites

- A GitHub account.
- Your code pushed to a GitHub repository.
- Your Gemini cookies (`__Secure-1PSID` and `__Secure-1PSIDTS`).

## 2. Push to GitHub

If you haven't already, commit your changes and push to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push
```

## 3. Create a Web Service on Render

1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Click **"New +"** and select **"Web Service"**.
3.  Connect your GitHub repository.
4.  Configure the service:
    -   **Name**: `my-gemini-app` (or whatever you like)
    -   **Region**: Choose one close to you (e.g., Singapore, Oregon).
    -   **Branch**: `main` (or `master`).
    -   **Runtime**: `Python 3`.
    -   **Build Command**: `pip install -r requirements.txt` (Default is usually correct).
    -   **Start Command**: `gunicorn app:app` (Render might auto-detect this from `Procfile`).
    -   **Instance Type**: `Free`.

## 4. Environment Variables (CRITICAL)

You **MUST** add your environment variables for the app to work.

1.  Scroll down to the **Environment Variables** section (or go to the "Environment" tab).
2.  Add the following keys and values:

    | Key | Value |
    | :--- | :--- |
    | `GEMINI_COOKIE_1PSID` | Your `__Secure-1PSID` cookie value |
    | `GEMINI_COOKIE_1PSIDTS` | Your `__Secure-1PSIDTS` cookie value |
    | `PYTHON_VERSION` | `3.10.0` (Optional, but good for stability) |

3.  Click **"Create Web Service"**.

## 5. Wait for Deploy

Render will start building your app. It may take a few minutes.
-   Watch the logs.
-   If you see "Your service is live", click the URL at the top (e.g., `https://my-gemini-app.onrender.com`).

## Troubleshooting

-   **502 Bad Gateway**: Usually means the app failed to start. Check the "Logs" tab.
-   **Cookie Errors**: If image generation fails, your cookies might be expired or copied incorrectly. Update them in the Render Environment variables.
-   **Images Disappearing**: On the free tier, files saved to disk (like generated images) are DELETED when the app restarts (which happens frequently).
    -   *Solution*: For a permanent app, you would need to implement Cloudinary or AWS S3 storage. For now, just save images you like to your computer immediately!
