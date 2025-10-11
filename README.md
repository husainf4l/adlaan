# 🚀 Adlaan Project - Complete Setup Guide

Welcome to the Adlaan project! This repository contains both the Django web application and the AI agent system.

## 📁 Project Structure

```
adlaan/
├── adlaan-web/          # 🌐 Django Web Application
│   ├── adlaan_project/  # Django project files
│   ├── templates/       # HTML templates (including password reset)
│   ├── static/          # CSS, JS, images
│   ├── locale/          # Internationalization files
│   ├── venv/            # Python virtual environment
│   └── manage.py        # Django management script
├── adlaan-agent/        # 🤖 AI Agent System (FastAPI + LangGraph)
│   ├── agent/           # Agent logic and nodes
│   ├── models/          # Database models
│   ├── venv/            # Python virtual environment
│   └── main.py          # FastAPI server
├── .vscode/             # VS Code configuration
└── start.sh             # 🚀 Easy startup script
```

## ⚡ Quick Start

### 1. **Using the Startup Script (Recommended)**

```bash
# Make script executable (first time only)
chmod +x start.sh

# Start both servers
./start.sh both

# Or start individually
./start.sh web      # Django web server only
./start.sh agent    # AI agent server only
./start.sh help     # Show all options
```

### 2. **Using VS Code Tasks**

1. Open project in VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Tasks: Run Task"
4. Choose:
   - `🌐 Run Django Web Server` - Start web app
   - `🤖 Run AI Agent Server` - Start AI agent
   - `🚀 Run Both Servers` - Start both simultaneously

## 🌐 Web Application (Django)

### Features
- ✅ **User Authentication** (Login, Signup, Logout)
- ✅ **Password Reset** with email notifications
- ✅ **Internationalization** (English/Arabic)
- ✅ **Responsive Design** with Tailwind CSS
- ✅ **HTMX Integration** for dynamic interactions

### URLs
- **Home**: http://127.0.0.1:8000/
- **Login**: http://127.0.0.1:8000/login/
- **Password Reset**: http://127.0.0.1:8000/password_reset/
- **Admin**: http://127.0.0.1:8000/admin/

### Manual Setup
```bash
cd adlaan-web
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 🤖 AI Agent System (FastAPI)

### Features
- 🧠 **LangGraph-based** multi-agent system
- 🔄 **Three-stage architecture** (Thinking → Planning → Action)
- 💾 **Session management** with checkpointing
- 🌊 **Streaming responses** 
- 📊 **Debug interface** for workflow visualization

### URLs
- **API**: http://127.0.0.1:8001/
- **Debug Interface**: http://127.0.0.1:8001/debug
- **Docs**: http://127.0.0.1:8001/docs

### Manual Setup
```bash
cd adlaan-agent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## 🔧 Configuration

### Environment Files

#### Django Web App (`.env`)
```bash
# Located in: adlaan-web/.env
SECRET_KEY=your-secret-key
DEBUG=True
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@adlaan.com
```

#### AI Agent (`.env`)
```bash
# Located in: adlaan-agent/.env
OPENAI_API_KEY=your-openai-api-key-here
HOST=127.0.0.1
PORT=8001
DEBUG=True
```

## 🧪 Testing Password Reset

### Automated Test User Creation
```bash
# Using startup script
./start.sh test

# Or manually
cd adlaan-web && source venv/bin/activate
python manage.py shell -c "
from django.contrib.auth.models import User
user, created = User.objects.get_or_create(
    username='testuser', 
    defaults={'email': 'test@example.com'}
)
user.set_password('testpass123')
user.save()
print('Test user created!')
"
```

### Test Process
1. **Go to**: http://127.0.0.1:8000/password_reset/
2. **Enter email**: `test@example.com`
3. **Submit form**
4. **Check Django terminal** - email appears there (console backend)
5. **Copy reset URL** from email and test it

### Test User Credentials
- **Username**: `testuser`
- **Email**: `test@example.com`
- **Password**: `testpass123`

## 🎨 VS Code Tasks

| Task | Description |
|------|-------------|
| 🌐 **Run Django Web Server** | Start Django development server |
| 🤖 **Run AI Agent Server** | Start FastAPI agent server |
| 🚀 **Run Both Servers** | Start both servers simultaneously |
| 📦 **Install Web Dependencies** | Install Django app requirements |
| 🧠 **Install Agent Dependencies** | Install AI agent requirements |
| 🗄️ **Django Migrate** | Run database migrations |
| 👤 **Django Create Superuser** | Create admin user |
| 🧪 **Test Password Reset** | Create test user for password reset |

## 🔗 Key Features Implemented

### ✅ Password Reset System
- Complete email-based password reset flow
- Console email backend for development
- Production-ready SMTP configuration
- Internationalized templates
- Secure token generation

### ✅ Multi-Project Architecture
- Separate Django web app and AI agent
- Independent virtual environments
- Coordinated development workflow
- Easy deployment separation

### ✅ Development Tools
- VS Code task integration
- Debug configurations
- Automated setup scripts
- Environment management

## 🚀 Quick Commands

```bash
# Start everything
./start.sh both

# Stop all servers
./start.sh stop

# Create test user
./start.sh test

# Individual servers
./start.sh web
./start.sh agent

# Help
./start.sh help
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill processes on port 8000 or 8001
sudo lsof -ti:8000 | xargs kill -9
sudo lsof -ti:8001 | xargs kill -9
```

### Virtual Environment Issues
```bash
# Recreate virtual environments
rm -rf adlaan-web/venv adlaan-agent/venv
./start.sh both  # Will recreate automatically
```

### Database Issues
```bash
cd adlaan-web
source venv/bin/activate
rm db.sqlite3  # Delete database
python manage.py migrate  # Recreate
```

## 📝 Development Notes

- **Django runs on**: `127.0.0.1:8000`
- **AI Agent runs on**: `127.0.0.1:8001`
- **Password reset emails**: Appear in Django terminal (development)
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Static files**: Served by Django in development

---

**🎉 Happy coding with Adlaan!** 🚀