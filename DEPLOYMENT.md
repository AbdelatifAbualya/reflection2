# Deployment Guide - Reflection2 Dual Model RCI

This guide provides comprehensive instructions for deploying the Reflexive Code Intelligence system with dual DeepSeek V3 and Qwen 2.5-72B models.

## 📋 Prerequisites

### Required Accounts & API Keys

1. **Fireworks.ai Account** (for both models)
   - Sign up at [fireworks.ai](https://fireworks.ai)
   - Navigate to API section
   - Generate API key
   - Copy key for environment setup
   - This provides access to both DeepSeek V3 and Qwen3 models

3. **Vercel Account** (for deployment)
   - Sign up at [vercel.com](https://vercel.com)
   - Connect GitHub account
   - Install Vercel CLI: `npm install -g vercel`

### System Requirements

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Git**: Latest version
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

## 🚀 Deployment Options

### Option 1: Vercel Deployment (Recommended)

#### Step 1: Repository Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/reflection2.git
cd reflection2

# Install dependencies
npm install

# Verify installation
npm run build
```

#### Step 2: Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

Add your API keys:
```env
# Fireworks.ai API Key (for DeepSeek V3)
FIREWORKS_API_KEY=fw_xxxxxxxxxxxxxxxxxxxxxxxxx

# OpenRouter API Key (for Qwen 2.5-72B)
OPENROUTER_API_KEY=sk-or-vx-xxxxxxxxxxxxxxxxxxxxxxx

# Optional: Set deployment URL
VERCEL_URL=https://your-app-name.vercel.app
```

#### Step 3: Deploy to Vercel

**Option A: CLI Deployment**
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Project name: reflection2
# - Directory: ./
# - Deploy? Yes

# Set environment variables
vercel env add FIREWORKS_API_KEY
vercel env add OPENROUTER_API_KEY

# Redeploy with environment variables
vercel --prod
```

**Option B: GitHub Integration**
1. Push repository to GitHub
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import from GitHub
5. Select your repository
6. Configure environment variables:
   - `FIREWORKS_API_KEY`
   - `OPENROUTER_API_KEY`
7. Click "Deploy"

#### Step 4: Verification
```bash
# Test deployment
curl https://your-app-name.vercel.app/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, test the API","model":"deepseek-chat","dualMode":false}'
```

### Option 2: Local Development

#### Step 1: Local Setup
```bash
# Clone and install
git clone https://github.com/yourusername/reflection2.git
cd reflection2
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your API keys
```

#### Step 2: Run Development Server
```bash
# Start development server
npm run dev

# Or with Vercel CLI for serverless function testing
vercel dev
```

#### Step 3: Access Application
- Open [http://localhost:3000](http://localhost:3000)
- Test dual model functionality
- Verify API responses

### Option 3: Custom Server Deployment

#### Step 1: Server Setup (Ubuntu/Debian)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

#### Step 2: Application Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/reflection2.git
cd reflection2

# Install dependencies
npm install

# Create production environment file
cp .env.example .env.production
# Edit with your API keys

# Build application (if applicable)
npm run build
```

#### Step 3: Process Management
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'reflection2',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/reflection2',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production'
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 4: Nginx Configuration
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/reflection2

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/reflection2 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔧 Configuration Details

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `FIREWORKS_API_KEY` | Yes | Fireworks.ai API key for both models | `fw_abc123...` |
| `NODE_ENV` | No | Environment mode | `production` |
| `PORT` | No | Server port (local only) | `3000` |

### API Configuration

The system uses two main API endpoints:

1. **DeepSeek V3 (Fireworks.ai)**
   - Endpoint: `https://api.fireworks.ai/inference/v1/chat/completions`
   - Model: `accounts/fireworks/models/deepseek-v3`
   - Rate Limits: Check Fireworks.ai documentation

2. **Qwen 2.5-72B (OpenRouter)**
   - Endpoint: `https://openrouter.ai/api/v1/chat/completions`
   - Model: `qwen/qwen-2.5-72b-instruct`
   - Rate Limits: Check OpenRouter documentation

### Performance Optimization

#### Vercel Configuration (`vercel.json`)
```json
{
  "functions": {
    "api/chat.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=0, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

#### Edge Runtime (Optional)
For faster cold starts, consider Edge Runtime:
```javascript
// Add to api/chat.js
export const config = {
  runtime: 'edge',
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. API Key Errors
```
Error: Invalid API key
```
**Solution:**
- Verify API keys are correctly set in environment
- Check for extra spaces or characters
- Ensure keys have proper permissions

#### 2. Model Not Found
```
Error: Model not found
```
**Solution:**
- Verify model names in API configuration
- Check if models are available in your region
- Update to latest model versions

#### 3. CORS Issues (Local Development)
```
Error: CORS policy blocked
```
**Solution:**
- Ensure API handler includes CORS headers
- Use proper origin configuration
- Test with different browsers

#### 4. Deployment Timeouts
```
Error: Function timeout
```
**Solution:**
- Increase maxDuration in vercel.json
- Optimize API calls
- Implement request caching

### Debug Mode

Enable debug logging by adding to environment:
```env
DEBUG=true
LOG_LEVEL=debug
```

### Health Check

Test API endpoints:
```bash
# Health check
curl https://your-app.vercel.app/api/health

# Model test
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "model": "deepseek-chat",
    "dualMode": false
  }'
```

## 📊 Monitoring & Analytics

### Vercel Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to your app (if using React/Next.js)
import { Analytics } from '@vercel/analytics/react'
```

### Custom Logging
```javascript
// Add to api/chat.js
console.log('API Request:', {
  timestamp: new Date().toISOString(),
  model: requestBody.model,
  dualMode: requestBody.dualMode,
  responseTime: Date.now() - startTime
});
```

## 🔒 Security Best Practices

### API Key Security
- Never commit API keys to version control
- Use environment variables for all secrets
- Rotate keys regularly
- Monitor API usage for anomalies

### CORS Configuration
```javascript
// Restrictive CORS for production
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

### Rate Limiting
```javascript
// Basic rate limiting example
const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }
  
  const requests = rateLimit.get(ip).filter(time => time > windowStart);
  
  if (requests.length >= 10) { // 10 requests per minute
    return false;
  }
  
  requests.push(now);
  rateLimit.set(ip, requests);
  return true;
}
```

## 📈 Scaling Considerations

### Vercel Pro Features
- Increased function execution time
- More concurrent executions
- Advanced analytics
- Custom domains

### Alternative Platforms
- **Netlify**: Similar serverless deployment
- **Railway**: Full-stack deployment with databases
- **DigitalOcean App Platform**: Container-based deployment
- **AWS Lambda**: Custom serverless setup

## 🆘 Support & Maintenance

### Regular Maintenance
- Update dependencies monthly
- Monitor API usage and costs
- Review error logs weekly
- Test dual model functionality

### Backup Strategy
- Regular repository backups
- Environment variable documentation
- Deployment configuration versioning

### Contact & Support
- GitHub Issues for bugs
- Discussions for feature requests
- Documentation updates via PR

---

**Happy Deploying! 🚀**

*This deployment guide ensures your dual-model RCI system runs smoothly in production.*
