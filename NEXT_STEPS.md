# Next Steps: Multi-User System Implementation

**Date Created:** 2025-12-29  
**Status:** Planning for tomorrow

---

## 🎯 Goal: Public Deployment with Multi-User Support

Transform the current single-user Gemini image generator into a multi-user platform where each user signs in with their own Gemini cookies.

---

## 📋 Implementation Plan

### Phase 1: Database Setup

**Technology:** PostgreSQL (or SQLite for simpler deployment)

**Database Schema:**

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- User cookies table (encrypted)
CREATE TABLE user_cookies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    psid_encrypted TEXT NOT NULL,
    psidts_encrypted TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Generated images table
CREATE TABLE generated_images (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    aspect_ratio VARCHAR(20),
    style VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking table
CREATE TABLE usage_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    images_generated INTEGER DEFAULT 0,
    last_generation TIMESTAMP,
    daily_quota_used INTEGER DEFAULT 0,
    quota_reset_date DATE
);
```

---

### Phase 2: User Authentication System

**Features to Add:**

1. **Registration Page**
   - Username, email, password
   - Email verification (optional)
   - Terms of service acceptance

2. **Login System**
   - Session management with Flask-Login
   - Remember me functionality
   - Password reset via email

3. **Cookie Management Page**
   - Guide users to extract their Gemini cookies
   - Secure form to paste cookies
   - Cookie validation before saving
   - Cookie expiration warnings

4. **User Dashboard**
   - View generation history
   - Manage saved images
   - Update cookies
   - Usage statistics

---

### Phase 3: Multi-User Architecture

**Changes Needed:**

1. **Backend Modifications:**
   ```python
   # Instead of global GEMINI_COOKIES
   def get_user_cookies(user_id):
       # Fetch and decrypt user's cookies from database
       pass
   
   # Generate images with user's cookies
   def generate_images_for_user(user_id, prompt, ...):
       cookies = get_user_cookies(user_id)
       client = GeminiClient(cookies)
       # ... generation logic
   ```

2. **Session Management:**
   - Flask-Login for user sessions
   - @login_required decorators on routes
   - Per-user Gemini client instances

3. **Cookie Encryption:**
   - Use cryptography library (Fernet)
   - Encrypt cookies before storing
   - Decrypt only when needed for generation

---

### Phase 4: Image Gallery & History

**Features:**

1. **Personal Gallery**
   - Grid view of all user's generated images
   - Filter by date, prompt, style
   - Search functionality

2. **Image Management**
   - Delete images
   - Download in bulk
   - Share links (optional)

3. **Generation History**
   - View all past prompts
   - Re-use previous prompts
   - Track usage statistics

---

### Phase 5: Rate Limiting & Quotas

**Implementation:**

1. **Daily Limits**
   - Free tier: 20 images/day
   - Premium tier: 100 images/day (optional)

2. **Rate Limiting**
   - Max 5 requests per minute
   - Cooldown between generations

3. **Usage Tracking**
   - Count images per user
   - Reset quotas daily
   - Display remaining quota

---

## 🛠️ Technical Stack

### Required Libraries:
```txt
flask==3.0.0
flask-cors==4.0.0
flask-login==0.6.3
flask-sqlalchemy==3.1.1
psycopg2-binary==2.9.9  # For PostgreSQL
cryptography==41.0.7
python-dotenv==1.0.0
pillow==10.1.0
requests==2.31.0
werkzeug==3.0.1
gemini-webapi==2.4.11
```

### New Files to Create:
- `models.py` - Database models
- `auth.py` - Authentication routes
- `database.py` - Database initialization
- `encryption.py` - Cookie encryption utilities
- `templates/login.html` - Login page
- `templates/register.html` - Registration page
- `templates/dashboard.html` - User dashboard
- `templates/cookie_setup.html` - Cookie management

---

## 🔐 Security Considerations

### Cookie Security:
1. **Encryption at Rest**
   - Use Fernet symmetric encryption
   - Store encryption key in environment variable
   - Never log or expose cookies

2. **HTTPS Required**
   - Force HTTPS in production
   - Secure cookie flags
   - CSRF protection

3. **Cookie Validation**
   - Test cookies before saving
   - Detect expired cookies
   - Prompt users to refresh

### User Security:
1. **Password Hashing**
   - Use bcrypt or Argon2
   - Salt all passwords
   - Minimum password requirements

2. **Session Security**
   - Secure session cookies
   - Session timeout after inactivity
   - Logout functionality

---

## 🚀 Deployment Strategy

### Option 1: Railway.app (Recommended)
- Free PostgreSQL database
- Easy deployment from GitHub
- Automatic HTTPS
- Environment variable management

### Option 2: Heroku
- Free tier available
- PostgreSQL add-on
- Simple git-based deployment

### Option 3: DigitalOcean
- More control
- $5/month droplet
- Manual setup required

---

## ⚠️ Important Warnings

### Legal/ToS Issues:
- Still using unofficial Gemini API
- Violates Google's Terms of Service
- Risk of account suspension
- **Not recommended for commercial use**

### Alternative (Legal) Approach:
- Switch to official Google AI API
- Users pay for their own API keys
- More expensive but legal and stable
- Better for commercial deployment

---

## 📊 Estimated Timeline

- **Database Setup:** 2-3 hours
- **User Authentication:** 4-6 hours
- **Multi-User Architecture:** 3-4 hours
- **Image Gallery:** 2-3 hours
- **Rate Limiting:** 1-2 hours
- **Testing & Debugging:** 3-4 hours
- **Deployment:** 2-3 hours

**Total:** ~2-3 days of development

---

## ✅ Tomorrow's Checklist

- [ ] Set up PostgreSQL database
- [ ] Create database models (SQLAlchemy)
- [ ] Implement user registration
- [ ] Implement login system
- [ ] Add cookie management page
- [ ] Modify generation to use user cookies
- [ ] Create user dashboard
- [ ] Add image gallery
- [ ] Implement rate limiting
- [ ] Test multi-user functionality
- [ ] Deploy to Railway/Heroku

---

## 🎯 Success Criteria

1. Users can register and login ✅
2. Users can add their own Gemini cookies ✅
3. Each user generates images with their cookies ✅
4. Users can view their image history ✅
5. Rate limiting prevents abuse ✅
6. System handles multiple concurrent users ✅
7. Cookies are encrypted and secure ✅

---

## 📝 Notes

- Keep current single-user version as fallback
- Consider adding admin panel for monitoring
- Add analytics to track usage patterns
- Plan for cookie expiration notifications
- Consider adding image storage (S3/Cloudinary)

---

**Ready to start tomorrow!** 🚀
