# 🔐 Update Your Gemini Cookies

## ⚠️ Your Cookies Have Expired!

The error message shows:
```
Failed to initialize client. SECURE_1PSIDTS could get expired frequently
```

This means your Gemini session cookies need to be refreshed. Follow these steps:

---

## 📋 Quick Update Steps

### 1. Open Gemini in Your Browser
Go to: https://gemini.google.com

### 2. Make Sure You're Logged In
- You should see the Gemini chat interface
- If not logged in, sign in with your Google account

### 3. Open Developer Tools
- **Windows/Linux**: Press `F12` or `Ctrl + Shift + I`
- **Mac**: Press `Cmd + Option + I`

### 4. Go to Application Tab
- Click the **"Application"** tab (or "Storage" in Firefox)
- In the left sidebar, expand **"Cookies"**
- Click on `https://gemini.google.com`

### 5. Find and Copy These Two Cookies

Look for these cookie names and copy their **Value** column:

#### Cookie 1: `__Secure-1PSID`
- Find the row with name `__Secure-1PSID`
- Click on the **Value** field
- Copy the entire value (starts with `g.a000...`)

#### Cookie 2: `__Secure-1PSIDTS`
- Find the row with name `__Secure-1PSIDTS`  
- Click on the **Value** field
- Copy the entire value (starts with `sidts-...`)

### 6. Update Your `.env` File

Open `d:\gemini web\.env` and update these lines:

```env
GEMINI_COOKIE_1PSID=g.a000xxxxxxxxxxxxx...
GEMINI_COOKIE_1PSIDTS=sidts-xxxxxxxxxxxxx...
```

**Replace the entire value** after the `=` sign with your new cookies.

### 7. Restart the Server

Stop the current server (Ctrl+C in terminal) and restart:

```bash
python app.py
```

You should see:
```
✅ Gemini client initialized successfully!
```

---

## ✅ How to Verify It's Working

1. Open http://127.0.0.1:5000
2. Check the top-right status indicator
3. It should show **"Connected"** in green ✅

---

## 🔄 How Often Do Cookies Expire?

- **`__Secure-1PSID`**: Lasts several weeks
- **`__Secure-1PSIDTS`**: Expires more frequently (days to weeks)

**Tip**: If you get errors, update both cookies to be safe!

---

## 🎯 What's Been Fixed (Waiting to Test)

While updating cookies, here's what I improved:

### ✅ Aspect Ratio Enforcement System
- Added intelligent cropping to force exact aspect ratios
- **Square (1:1)**: Crops to 1024x1024
- **Landscape (16:9)**: Crops to 1920x1080  
- **Portrait (9:16)**: Crops to 1080x1920

### How It Works:
1. Gemini generates an image (any size)
2. System downloads the image
3. Crops it to exact aspect ratio (center crop)
4. Resizes to standard dimensions
5. Returns processed image

**Once cookies are updated, test with:**
- Prompt: "a beautiful sunset"
- Aspect Ratio: Landscape
- Quantity: 1

The image should be **1920x1080 pixels** (wide landscape)!

---

## 🆘 Still Having Issues?

If cookies still don't work:

1. **Clear browser cache** and log out/in to Gemini
2. **Try incognito mode** to get fresh cookies
3. **Check cookie expiration** - make sure they haven't expired immediately
4. **Verify you copied the full value** - cookies are very long!

---

**After updating cookies, your app will be fully functional with perfect aspect ratio control!** 🚀
