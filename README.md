# Gemini Web Interface 🤖✨

A modern, highly responsive web interface for Google's Gemini AI, built with Flask and the `gemini-webapi` library.

## 🌟 Features

-   **Stateless Chat**: Fast, reliable chat experience with no history persistence issues.
-   **Vision Capabilities**: Upload and chat with images using Gemini's multimodal capabilities.
-   **Image Generation**: Generate AI images using Gemini's hidden capabilities (requires cookies).
-   **Responsive Design**: Mobile-friendly "Neo-Brutalist" UI with smooth animations.
-   **Secure**: Environment-based configuration for cookies and secrets.

## 🛠️ Tech Stack

-   **Backend**: Python, Flask, Gunicorn
-   **Frontend**: HTML5, CSS3, Vanilla JavaScript
-   **AI Integration**: `gemini-webapi` (Reverse engineered API)

## 🚀 Deployment

This project is ready for deployment on platforms like Render.com.

1.  Clone the repository.
2.  Install dependencies: `pip install -r requirements.txt`
3.  Set environment variables: `GEMINI_COOKIE_1PSID` and `GEMINI_COOKIE_1PSIDTS`.
4.  Run the app: `gunicorn app:app`

## 📝 Configuration

Copy `.env.example` to `.env` and add your cookies:

```properties
GEMINI_COOKIE_1PSID=your_cookie_here
GEMINI_COOKIE_1PSIDTS=your_cookie_here
```

## 📄 License

MIT
