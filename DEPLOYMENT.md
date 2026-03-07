# Deployment Guide - Dream Analyzer API

## 🚀 Production Deployment Checklist

### 1. Environment Variables

Production `.env` dosyası:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Supabase Configuration (Production values)
SUPABASE_URL=https://your-production-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# JWT Configuration (Strong secret for production!)
JWT_SECRET=super-strong-production-secret-minimum-64-characters-recommended
JWT_EXPIRES_IN=7d

# Application
API_PREFIX=api
```

### 2. Build Production Bundle

```bash
# Install dependencies
bun install --production

# Build
bun run build

# Test production build
bun run start:prod
```

### 3. Docker Deployment (Recommended)

#### Dockerfile

```dockerfile
FROM oven/bun:1 as builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install production dependencies only
RUN bun install --production --frozen-lockfile

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/i18n ./dist/i18n

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD bun run -e "fetch('http://localhost:3000/api/docs').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Start
CMD ["bun", "run", "start:prod"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - '3000:3000'
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/docs']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Build ve çalıştır:

```bash
# Build image
docker build -t dream-analyzer-api .

# Run container
docker run -d \
  --name dream-analyzer \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  dream-analyzer-api

# Veya docker-compose ile
docker-compose up -d
```

### 4. Cloud Platform Deployment

#### Vercel

`vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

Deploy:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Railway

##### İlk Deployment (GitHub ile)

1. Railway.app'e giriş yapın
2. "New Project" > "Deploy from GitHub repo"
3. Environment variables ekleyin
4. Deploy!

##### Railway CLI ile Güncelleme

```bash
# Railway CLI'yi yükle (eğer yoksa)
npm i -g @railway/cli
# veya
bun add -g @railway/cli

# Railway'e giriş yap
railway login

# Projeyi bağla (ilk seferinde)
railway link

# Veya mevcut projeyi seç
railway link <project-id>

# Environment variables'ları göster
railway variables

# Environment variable ekle/güncelle
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_ANON_KEY=your-key
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-key
railway variables set JWT_SECRET=your-secret
railway variables set PORT=3000
railway variables set NODE_ENV=production

# Deploy (güncelleme yap)
railway up

# Veya belirli bir branch'ten deploy et
railway up --branch main

# Logları görüntüle
railway logs

# Logları takip et (real-time)
railway logs --follow

# Service durumunu kontrol et
railway status

# Service'i yeniden başlat
railway restart

# Service'i durdur
railway down

# Production URL'ini göster
railway domain
```

##### Railway Build & Start Komutları

Railway otomatik olarak `package.json`'daki script'leri algılar. Eğer özel komutlar istersen:

```bash
# Build komutu ayarla
railway variables set RAILWAY_BUILD_COMMAND="bun install && bun run build"

# Start komutu ayarla
railway variables set RAILWAY_START_COMMAND="bun run start:prod"
```

Veya `railway.json` dosyası oluştur:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "bun install && bun run build"
  },
  "deploy": {
    "startCommand": "bun run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

##### Hızlı Güncelleme Workflow

```bash
# 1. Değişiklikleri yap ve commit et
git add .
git commit -m "Update: yeni özellikler"

# 2. Railway'e deploy et
railway up

# 3. Logları kontrol et
railway logs --follow
```

#### Render

1. Render.com'da "New Web Service"
2. GitHub repo'nuzu bağlayın
3. Build Command: `bun install && bun run build`
4. Start Command: `bun run start:prod`
5. Environment variables ekleyin

### 5. Monitoring & Logging

#### PM2 (VPS/Dedicated Server için)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/main.js --name dream-analyzer

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
```

`ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'dream-analyzer-api',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M',
    },
  ],
};
```

Çalıştır:

```bash
pm2 start ecosystem.config.js
```

### 6. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

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
```

SSL ile (Let's Encrypt):

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renew
sudo certbot renew --dry-run
```

### 7. Security Checklist

- [ ] `.env` dosyası `.gitignore`'da
- [ ] Güçlü JWT_SECRET (min 64 karakter)
- [ ] Rate limiting ekle (TODO)
- [ ] CORS yapılandırması
- [ ] Helmet.js ekle (security headers)
- [ ] HTTPS kullan
- [ ] Environment variables encrypt et
- [ ] Database connection pool limits ayarla
- [ ] Log rotation ayarla

### 8. Performance Optimization

```typescript
// main.ts'e eklenebilecekler:

import helmet from '@fastify/helmet';
import compression from '@fastify/compress';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  await app.register(helmet);

  // Response compression
  await app.register(compression);

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(env.PORT);
}
```

### 9. Monitoring

#### Sentry (Error Tracking)

```bash
bun add @sentry/node
```

```typescript
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Health Check Endpoint

```typescript
// app.controller.ts
@Controller()
export class AppController {
  @Get('health')
  @Public()
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
```

### 10. Database Backups (Supabase)

Supabase Dashboard'da:

1. Settings > Database
2. Enable Point-in-Time Recovery (PITR)
3. Schedule automated backups

Veya CLI ile:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Create backup
supabase db dump > backup-$(date +%Y%m%d).sql
```

### 11. CI/CD Pipeline

#### GitHub Actions

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Lint
        run: bun run lint

      - name: Build
        run: bun run build

      - name: Deploy to production
        run: |
          # Your deployment script here
          # e.g., scp, rsync, or cloud provider CLI
```

### 12. Post-Deployment Tests

```bash
# Health check
curl https://api.yourdomain.com/health

# API docs
curl https://api.yourdomain.com/api/docs

# Register test
curl -X POST https://api.yourdomain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test12345",
    "name": "Test",
    "surname": "User"
  }'
```

## 📊 Monitoring Dashboard

Recommended tools:

- **Uptime**: UptimeRobot, Better Uptime
- **Logs**: Logtail, Papertrail
- **Errors**: Sentry
- **Performance**: New Relic, DataDog
- **Analytics**: PostHog, Mixpanel

## 🔧 Troubleshooting

### High Memory Usage

```bash
# Check memory
pm2 monit

# Restart if needed
pm2 restart dream-analyzer-api

# Increase memory limit
pm2 start dist/main.js --max-memory-restart 1G
```

### Slow Response Times

1. Check database query performance
2. Enable response caching
3. Add CDN for static assets
4. Scale horizontally (multiple instances)

### Database Connection Issues

1. Check Supabase connection pooling
2. Verify RLS policies
3. Check network/firewall rules

## 📞 Support

Production issues:

1. Check logs: `pm2 logs` veya cloud provider logs
2. Check Sentry errors
3. Monitor Supabase Dashboard > Logs
4. Check health endpoint

---

**Ready for Production!** 🚀
