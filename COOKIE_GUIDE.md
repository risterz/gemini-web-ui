# 🍪 Cookie Extraction Guide

This guide will help you extract the necessary cookies from your browser to authenticate with Gemini.

## Why Do I Need Cookies?

Cookies are small pieces of data that websites use to remember you're logged in. By extracting your Gemini session cookies, this application can make requests to Gemini on your behalf - just like your browser does when you use the official website.

## ⚠️ Security Warning

**Your cookies are like your password!**
- Anyone with your cookies can access your Gemini account
- Never share your cookies with anyone
- Never commit your `.env` file to Git
- Use a secondary Google account if you're concerned about security

---

## 📋 Step-by-Step Instructions

### For Google Chrome / Microsoft Edge

1. **Open Gemini and Log In**
   - Go to [gemini.google.com](https://gemini.google.com)
   - Make sure you're logged in with your Google account
   - You should see the Gemini chat interface

2. **Open Developer Tools**
   - Press `F12` on your keyboard
   - OR right-click anywhere and select "Inspect"
   - OR press `Ctrl+Shift+I` (Windows) or `Cmd+Option+I` (Mac)

3. **Navigate to Application Tab**
   - Click on the **Application** tab at the top of Developer Tools
   - If you don't see it, click the `>>` arrows to find it

4. **Find Cookies**
   - In the left sidebar, expand **Storage** → **Cookies**
   - Click on `https://gemini.google.com`
   - You'll see a list of all cookies

5. **Copy Required Cookies**
   
   Find these two cookies and copy their **Value** (the long string):
   
   **Cookie 1: `__Secure-1PSID`**
   - Click on the row with this name
   - Look at the **Value** column
   - Double-click the value to select it
   - Press `Ctrl+C` to copy
   - Save it somewhere temporarily (Notepad)
   
   **Cookie 2: `__Secure-1PSIDTS`**
   - Do the same for this cookie
   - Copy its value as well

6. **Update Your .env File**
   - Open your `.env` file (in the project folder)
   - Paste the values like this:
   
   ```env
   GEMINI_COOKIE_1PSID=g.a000abc123def456...
   GEMINI_COOKIE_1PSIDTS=sidts-xyz789abc123...
   ```
   
   - Save the file

---

### For Mozilla Firefox

1. **Open Gemini and Log In**
   - Go to [gemini.google.com](https://gemini.google.com)
   - Make sure you're logged in

2. **Open Developer Tools**
   - Press `F12` on your keyboard
   - OR right-click and select "Inspect Element"

3. **Navigate to Storage Tab**
   - Click on the **Storage** tab
   - If you don't see it, click the `>>` arrows

4. **Find Cookies**
   - In the left sidebar, expand **Cookies**
   - Click on `https://gemini.google.com`

5. **Copy Required Cookies**
   - Find `__Secure-1PSID` and copy its **Value**
   - Find `__Secure-1PSIDTS` and copy its **Value**

6. **Update Your .env File**
   - Same as Chrome instructions above

---

### For Safari (macOS)

1. **Enable Developer Menu**
   - Safari → Preferences → Advanced
   - Check "Show Develop menu in menu bar"

2. **Open Gemini and Log In**
   - Go to [gemini.google.com](https://gemini.google.com)

3. **Open Web Inspector**
   - Develop → Show Web Inspector
   - OR press `Cmd+Option+I`

4. **Navigate to Storage**
   - Click the **Storage** tab
   - Expand **Cookies** → `https://gemini.google.com`

5. **Copy Required Cookies**
   - Find and copy the same two cookies
   - Update your `.env` file

---

## 🔄 When to Refresh Cookies

Your cookies will expire periodically. You'll need to refresh them when:

### Signs Your Cookies Have Expired:
- ❌ Status indicator shows "Not Connected"
- ❌ Error message: "Cookie authentication failed"
- ❌ Generation fails immediately
- ❌ Health check returns "unhealthy"

### How Often to Refresh:
- Typically every **2-4 weeks**
- Sometimes sooner if you log out of Gemini
- Immediately if you change your Google password

### Quick Refresh Process:
1. Open Gemini in your browser
2. Make sure you're still logged in
3. Follow the extraction steps above
4. Update your `.env` file
5. Restart the server (`python app.py`)

---

## ✅ Verification

After updating your cookies, verify they work:

1. **Start the server**
   ```bash
   python app.py
   ```

2. **Check the status indicator**
   - Open `http://127.0.0.1:5000`
   - Look at the top-right corner
   - It should show "Connected" with a green dot

3. **Try generating an image**
   - Enter a simple prompt like "a cute cat"
   - Click "Generate Images"
   - If it works, your cookies are valid! ✨

---

## 🛠️ Troubleshooting

### "Cookie not found"

**Problem:** You can't find the required cookies in your browser.

**Solutions:**
- Make sure you're logged into Gemini
- Try refreshing the Gemini page
- Clear your browser cache and log in again
- Try a different browser

### "Invalid cookie format"

**Problem:** The application says your cookies are invalid.

**Solutions:**
- Make sure you copied the **entire** value (they're very long!)
- Check for extra spaces at the beginning or end
- Make sure you didn't include the cookie name, only the value
- Verify the `.env` file format is correct

### "Authentication failed" immediately

**Problem:** Cookies are rejected by Gemini.

**Solutions:**
- The cookies might be from the wrong account
- Try logging out and back into Gemini
- Extract fresh cookies
- Make sure you're using the same browser you extracted from

### Cookies expire too quickly

**Problem:** Cookies expire in less than a week.

**Possible causes:**
- You're logging out of Gemini
- You're clearing browser cookies
- You're using incognito/private mode
- Your Google account has security restrictions

**Solutions:**
- Stay logged into Gemini in your browser
- Don't clear cookies for gemini.google.com
- Use a regular browser window (not incognito)

---

## 🔒 Security Best Practices

1. **Use a Secondary Account**
   - Create a new Google account just for this
   - Don't use your main personal or work account

2. **Protect Your .env File**
   - Never commit it to Git (it's in `.gitignore`)
   - Don't share it with anyone
   - Don't upload it to cloud storage

3. **Rotate Cookies Regularly**
   - Refresh cookies every few weeks
   - If you suspect they're compromised, change your password

4. **Monitor Account Activity**
   - Check your Google account activity regularly
   - Look for suspicious logins
   - Enable 2FA on your Google account

5. **Local Use Only**
   - Don't deploy this publicly with your cookies
   - Run it only on your local machine
   - Don't share your server URL

---

## 📝 Example .env File

Here's what your `.env` file should look like:

```env
# Gemini Cookie Authentication
# Follow COOKIE_GUIDE.md to extract these values from your browser

GEMINI_COOKIE_1PSID=g.a000abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890
GEMINI_COOKIE_1PSIDTS=sidts-abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz

# Optional: Set to 'development' or 'production'
FLASK_ENV=development
```

**Note:** The actual cookie values are much longer than shown here!

---

## ❓ FAQ

### Q: Do I need both cookies?

**A:** Yes, both `__Secure-1PSID` and `__Secure-1PSIDTS` are required for authentication.

### Q: Can I use cookies from a different Google account?

**A:** Yes! Just make sure that account has access to Gemini.

### Q: Will this work with Gemini Pro?

**A:** Yes! Both free and Pro accounts work. Pro accounts may have higher rate limits.

### Q: Can multiple people use the same cookies?

**A:** Technically yes, but **don't do this**. It's a security risk and may trigger account restrictions.

### Q: What if I accidentally shared my cookies?

**A:** Immediately:
1. Change your Google password
2. Log out of all devices
3. Extract new cookies
4. Enable 2FA if you haven't

---

## 🆘 Still Having Issues?

If you're still stuck:
1. Read the [Troubleshooting](#troubleshooting) section above
2. Check the main [README.md](README.md) for general help
3. Make sure you followed every step exactly
4. Try using a different browser
5. Create a fresh Google account and try again

---

**Remember:** Your cookies are sensitive! Treat them like passwords and keep them secure. 🔐
