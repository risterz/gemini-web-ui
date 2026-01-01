# Free Tier Hosting Guide for Flask Apps

This guide outlines the best free hosting options for deploying projects that use Python (Flask) backends.

## 1. The "Static Giants" (Frontend Only)
*Best for: Pure HTML/CSS/JS sites, Portfolios, Documentation.*
*Cannot run: `app.py`, Python scripts, Databases.*

| Platform | Pros | Cons |
| :--- | :--- | :--- |
| **GitHub Pages** | • 100% Free forever<br>• Zero config (just push code)<br>• Fast | • Static only (HTML/CSS)<br>• No private repos on free tier (sometimes) |
| **Vercel / Netlify** | • Extremely fast (Global CDN)<br>• Modern workflow (Preview deploys)<br>• Supports "Serverless Functions" | • Setup for Python is complex (requires serverless adapter)<br>• Bandwidth limits on free tier |

## 2. The "Full Stack" (Python/Backend Supported)
*Best for: Flask, Django, FastAPI projects.*

| Platform | Key Features | The "Catch" (Free Tier) |
| :--- | :--- | :--- |
| **Render** | • **Easiest setup** (Connect GitHub -> Go)<br>• Native Docker/Python support<br>• Great logs & dashboard | • **Sleeps**: Spool down after 15m inactivity<br>• **Ephemeral**: Deletes created files (images) on restart |
| **PythonAnywhere** | • **Persistent Storage**: Files stay forever<br>• Does NOT sleep like Render<br>• Python-specific tools | • **Old Interface**: File manager style<br>• **API Whitelist**: Can only connect to specific approved external sites |
| **Fly.io** | • **Power User**: Real micro-VMs<br>• Fast cold starts | • **Complex**: Requires command line (flyctl)<br>• Small free allowance |

## 3. 🏆 The "Pro" Hybrid Strategy
This is the recommended approach for modern web apps to get the best performance for free.

**The Architecture:**
1.  **Host Frontend** (HTML/JS) on **Vercel/Netlify**.
    *   *Benefit*: Loads instantly, never sleeps, caches assets globally.
2.  **Host Backend** (API/Python) on **Render**.
    *   *Benefit*: Runs your logic free.
3.  **Connect Them**:
    *   The frontend makes `fetch()` calls to the backend URL.
    *   If the backend is "sleeping", show a "Waking up..." spinner on the frontend (like implemented in this project).

**Why this wins**:
Your site *feels* instant because the UI loads immediately from Vercel. The user only waits if they specifically use a feature that needs the Python server.
