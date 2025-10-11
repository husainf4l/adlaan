# 🌐 Google Cloud Deployment Guide for Adlaan

This guide will help you deploy Adlaan to Google Cloud Platform for public access.

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK** installed locally
3. **Docker** installed (for Cloud Run deployment)
4. **OpenAI API Key** for the AI agent

## 🚀 Quick Deployment Steps

### 1. **Setup Google Cloud Project**

```bash
# Install Google Cloud SDK if not already installed
# https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Create a new project (replace YOUR_PROJECT_ID)
gcloud projects create YOUR_PROJECT_ID --name="Adlaan Legal AI"

# Set the project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

### 2. **Setup Environment Variables**

```bash
# Copy the environment template
cp .env.example .env

# Edit the .env file with your values:
# - Add your OpenAI API key
# - Set your Django secret key
# - Configure database settings
```

### 3. **Deploy Database (Cloud SQL)**

```bash
# Create PostgreSQL instance
gcloud sql instances create adlaan-db \
    --database-version=POSTGRES_13 \
    --tier=db-f1-micro \
    --region=us-central1

# Create databases
gcloud sql databases create adlaan --instance=adlaan-db
gcloud sql databases create adlaan_agent --instance=adlaan-db

# Create users
gcloud sql users create adlaan --instance=adlaan-db --password=YOUR_DB_PASSWORD
gcloud sql users create agent_user --instance=adlaan-db --password=YOUR_AGENT_DB_PASSWORD

# Get connection name for later use
gcloud sql instances describe adlaan-db --format="value(connectionName)"
```

### 4. **Deploy Django Web App (App Engine)**

```bash
# Update app.yaml with your environment variables
# Then deploy:
gcloud app deploy app.yaml

# The app will be available at:
# https://YOUR_PROJECT_ID.appspot.com
```

### 5. **Deploy AI Agent (Cloud Run)**

```bash
# Build and deploy the AI agent
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/adlaan-agent

# Deploy to Cloud Run
gcloud run deploy adlaan-agent \
    --image gcr.io/YOUR_PROJECT_ID/adlaan-agent \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars OPENAI_API_KEY=YOUR_OPENAI_KEY,ENVIRONMENT=production

# Get the service URL
gcloud run services describe adlaan-agent --platform managed --region us-central1 --format="value(status.url)"
```

### 6. **Configure Custom Domain (Optional)**

```bash
# Map custom domain to App Engine
gcloud app domain-mappings create YOUR_DOMAIN.com

# Map custom domain to Cloud Run
gcloud run domain-mappings create --service adlaan-agent --domain api.YOUR_DOMAIN.com
```

## 🔧 Configuration Files Explained

### **app.yaml** - App Engine Configuration
- Configures Django web app for App Engine
- Handles static files and routing
- Sets environment variables

### **Dockerfile.web** - Django Web App Container
- Builds Django application for Cloud Run
- Installs dependencies and collects static files
- Configures Gunicorn WSGI server

### **Dockerfile.agent** - AI Agent Container  
- Builds FastAPI AI agent for Cloud Run
- Installs AI/ML dependencies
- Exposes streaming endpoint

### **cloudbuild.yaml** - Automated CI/CD
- Builds both Docker images
- Pushes to Google Container Registry
- Deploys to Cloud Run automatically

### **docker-compose.yml** - Local Development
- Runs both services locally
- Includes PostgreSQL database
- Environment variable management

## 🌍 Access Your Deployed Application

After deployment, you'll have:

### **Web Application**
- **URL**: `https://YOUR_PROJECT_ID.appspot.com`
- **Features**: User authentication, dashboard, legal platform

### **AI Agent API**
- **URL**: `https://adlaan-agent-RANDOM-ID.a.run.app`
- **Debug Interface**: `https://adlaan-agent-RANDOM-ID.a.run.app/debug`
- **API Endpoint**: `https://adlaan-agent-RANDOM-ID.a.run.app/api/chat`

## 📊 Cost Estimation

### **App Engine (Web App)**
- **Free Tier**: 28 hours/day free
- **Estimated**: $0-50/month for moderate traffic

### **Cloud Run (AI Agent)**
- **Free Tier**: 2 million requests/month
- **Estimated**: $10-100/month depending on usage

### **Cloud SQL (Database)**
- **db-f1-micro**: ~$7/month
- **Storage**: ~$0.17/GB/month

### **Total Estimated Cost**: $17-157/month

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` file
2. **Database**: Use strong passwords and SSL
3. **API Keys**: Rotate OpenAI API keys regularly
4. **IAM**: Set proper Cloud IAM permissions
5. **HTTPS**: Force SSL in production (enabled by default)

## 🚨 Troubleshooting

### **Common Issues:**

1. **API Quota Exceeded**
   ```bash
   gcloud services enable APP_NAME.googleapis.com
   ```

2. **Database Connection Issues**
   ```bash
   # Check Cloud SQL proxy setup
   gcloud sql instances describe adlaan-db
   ```

3. **Environment Variables Not Set**
   ```bash
   # Update App Engine env vars
   gcloud app deploy app.yaml
   ```

4. **Cloud Run Memory Issues**
   ```bash
   # Increase memory allocation
   gcloud run services update adlaan-agent --memory 1Gi
   ```

## 📈 Monitoring & Scaling

### **Monitor Performance**
```bash
# View logs
gcloud logs read "resource.type=gae_app"
gcloud logs read "resource.type=cloud_run_revision"

# Monitor metrics
gcloud monitoring dashboards list
```

### **Auto-Scaling Configuration**
- **App Engine**: Automatic (configured in app.yaml)
- **Cloud Run**: Automatic (0-100 instances by default)
- **Database**: Manual scaling available

## 🎯 Next Steps After Deployment

1. **Test all endpoints** to ensure functionality
2. **Setup monitoring** and alerts
3. **Configure backup** for Cloud SQL
4. **Add custom domain** for professional appearance
5. **Setup CI/CD** with Cloud Build triggers
6. **Monitor costs** and optimize resources

## 📞 Support

If you encounter issues:
1. Check Google Cloud Console for errors
2. Review application logs
3. Verify environment variables
4. Contact support team

---

**🎉 Congratulations! Your Adlaan Legal AI Platform is now live on Google Cloud!**

Access your applications:
- **Web App**: `https://YOUR_PROJECT_ID.appspot.com`
- **AI Agent**: Use the Cloud Run URL from deployment output