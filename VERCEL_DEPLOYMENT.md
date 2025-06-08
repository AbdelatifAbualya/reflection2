# Vercel Deployment Instructions

## Environment Variables Setup

**Important**: For Vercel deployment, environment variables are **NOT** stored in `.env` files. They must be configured in the Vercel Dashboard.

### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Dual Model RCI System"
   git branch -M main
   git remote add origin https://github.com/yourusername/reflection2.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Before deployment, go to **"Environment Variables"**

3. **Configure Environment Variables in Vercel Dashboard**
   ```
   Variable Name: FIREWORKS_API_KEY
   Value: your_actual_fireworks_api_key_here
   Environment: Production, Preview, Development (select all)
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Model Configuration

Both models are accessed via Fireworks.ai:
- **DeepSeek V3**: `accounts/fireworks/models/deepseek-v3-0324`
- **Qwen3 30B-A3B**: `accounts/fireworks/models/qwen3-30b-a3b`

### Local Development

The `.env` file is only for local development:
```bash
cp .env.example .env
# Edit .env and add your Fireworks API key
npm run dev
```

### Why No OpenRouter?

This system uses **both models from Fireworks.ai only**:
- Single provider = consistent API, rate limits, billing
- No need for multiple API keys
- Simplified deployment and maintenance
