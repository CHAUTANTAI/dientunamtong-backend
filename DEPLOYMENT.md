# 🚀 Deployment Guide

Production deployment guide for Backend v2.0

---

## 📋 Pre-Deployment Checklist

### Security
- [ ] Change `JWT_SECRET` to strong random key
- [ ] Use strong database password
- [ ] Enable database SSL (`DB_SSL=true`)
- [ ] Set `NODE_ENV=production`
- [ ] Disable `synchronize` in TypeORM
- [ ] Review and restrict CORS origins
- [ ] Enable HTTPS/SSL for API
- [ ] Set up firewall rules
- [ ] Review environment variables

### Performance
- [ ] Enable database connection pooling
- [ ] Set up database read replicas (optional)
- [ ] Configure CDN for static assets
- [ ] Enable response compression
- [ ] Set up rate limiting
- [ ] Configure caching strategy

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure logging (Winston, Pino)
- [ ] Set up health check monitoring
- [ ] Database performance monitoring
- [ ] API analytics

---

## 🏭 Production Environment Setup

### 1. Environment Variables

Create `.env.production`:

```env
# Server
NODE_ENV=production
PORT=4000

# Database (use production credentials)
DB_HOST=your-production-db-host.com
DB_PORT=5432
DB_USER=prod_user
DB_PASSWORD=super-strong-password-here
DB_NAME=dien_tu_nam_tong_prod
DB_SSL=true

# JWT (MUST change!)
JWT_SECRET=<generate-64-char-random-secret-here>
JWT_EXPIRES_IN=7d

# Supabase (production project)
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<prod-service-role-key>

# Storage
STORAGE_BUCKET=content
MAX_FILE_SIZE=5242880

# CORS (optional, for security)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. Generate Strong JWT Secret

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

Output example:
```
f4a8d2c1b9e7f3a6d4c8b2e9f1a7d3c6b8e4f2a9d5c7b1e8f4a6d2c9b3e7f1a5
```

Use this as `JWT_SECRET`.

---

## 🗄️ Database Setup

### Option 1: Managed Database (Recommended)

**Services:**
- AWS RDS (PostgreSQL)
- Google Cloud SQL
- Supabase Database
- DigitalOcean Managed Databases
- Heroku Postgres

**Benefits:**
- ✅ Automatic backups
- ✅ High availability
- ✅ Monitoring included
- ✅ Easy scaling

### Option 2: Self-Hosted Database

**Requirements:**
- PostgreSQL 14+
- SSL enabled
- Daily backups configured
- Connection pooling (PgBouncer)

### Database Configuration

```typescript
// src/config/database.ts
export const AppDataSource = new DataSource({
  type: "postgres",
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  
  // ⚠️ IMPORTANT: Disable in production!
  synchronize: false,  // Use migrations instead
  
  logging: false,      // Disable query logging
  
  ssl: ENV.DB_SSL ? { rejectUnauthorized: false } : false,
  
  // Connection pooling
  extra: {
    max: 20,           // Maximum pool size
    min: 5,            // Minimum pool size
    idleTimeoutMillis: 30000,
  },
});
```

---

## 📦 Build & Deploy

### Build Process

```bash
# Install dependencies
npm ci --production=false

# Build TypeScript
npm run build

# Output in dist/
```

### Deploy Options

#### Option 1: VPS/VM (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo>
cd backend

# Install dependencies
npm ci --production

# Build
npm run build

# Install PM2 (process manager)
sudo npm install -g pm2

# Create ecosystem config
pm2 init

# Edit ecosystem.config.js:
module.exports = {
  apps: [{
    name: 'backend-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
}

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
```

#### Option 2: Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: dien_tu_nam_tong
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Deploy:
```bash
docker-compose up -d
```

#### Option 3: Platform as a Service

**Heroku:**
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main

# Run migrations
heroku run npm run migration:run
```

**Railway.app / Render.com:**
- Connect GitHub repository
- Set environment variables in dashboard
- Deploy automatically on push

---

## 🔄 Database Migrations

### Generate Migration

```bash
# After changing entities
npm run migration:generate -- src/migrations/UpdateProductSchema
```

### Run Migrations (Production)

```bash
# SSH into production server
ssh user@your-server.com

cd /path/to/backend

# Run migrations
npm run migration:run

# Or with PM2
pm2 stop backend-api
npm run migration:run
pm2 start backend-api
```

### Rollback Migration

```bash
npm run migration:revert
```

---

## 🔒 Security Best Practices

### 1. HTTPS/SSL

**With Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4000;
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

### 2. Rate Limiting

Install express-rate-limit:
```bash
npm install express-rate-limit
```

Add to `src/index.ts`:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 3. Helmet (Security Headers)

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

### 4. CORS Configuration

```typescript
import cors from 'cors';

const allowedOrigins = ENV.ALLOWED_ORIGINS?.split(',') || ['*'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📊 Monitoring

### Health Check Endpoint

Already implemented: `GET /health`

**Uptime Monitor Services:**
- UptimeRobot (free)
- Pingdom
- StatusCake
- Datadog

Configure to ping `/health` every 5 minutes.

### Error Tracking

**Sentry Integration:**
```bash
npm install @sentry/node
```

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: ENV.NODE_ENV,
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

### Logging

**Winston:**
```bash
npm install winston
```

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (ENV.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/backend
          git pull
          npm ci
          npm run build
          pm2 restart backend-api
```

---

## 🔥 Performance Optimization

### 1. Database Indexes

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_product_name ON product(name);
CREATE INDEX idx_product_category ON product_category(product_id, category_id);
CREATE INDEX idx_product_active ON product(is_active);
```

### 2. Connection Pooling

Already configured in database config (max: 20, min: 5).

### 3. Caching (Future)

**Redis:**
```bash
npm install redis
```

Cache expensive queries for 5-15 minutes.

### 4. Compression

```bash
npm install compression
```

```typescript
import compression from 'compression';
app.use(compression());
```

---

## 📝 Backup Strategy

### Database Backups

**Automated (daily):**
```bash
# Cron job
0 2 * * * pg_dump -U postgres dien_tu_nam_tong_prod | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

**Retention:**
- Daily backups: Keep 7 days
- Weekly backups: Keep 4 weeks
- Monthly backups: Keep 12 months

### File Storage Backups

Supabase Storage has automatic backups. Verify settings in Supabase Dashboard.

---

## 🎯 Rollback Plan

### Application Rollback

```bash
# With PM2
pm2 list
pm2 stop backend-api
git checkout <previous-commit>
npm ci
npm run build
pm2 start backend-api

# With Docker
docker-compose down
docker-compose up -d --build <previous-image-tag>
```

### Database Rollback

```bash
# Revert last migration
npm run migration:revert

# Restore from backup
psql -U postgres dien_tu_nam_tong_prod < backup.sql
```

---

## 📊 Post-Deployment Checklist

- [ ] API is accessible
- [ ] Health check returns 200 OK
- [ ] Login works
- [ ] Protected routes require authentication
- [ ] Database migrations ran successfully
- [ ] No errors in logs
- [ ] Monitoring alerts configured
- [ ] Backups running
- [ ] SSL certificate valid
- [ ] Performance metrics baseline recorded

---

## 🆘 Troubleshooting

### High CPU Usage

**Diagnosis:**
```bash
pm2 monit
htop
```

**Solutions:**
- Scale horizontally (add more instances)
- Optimize database queries
- Add caching
- Review slow endpoints

### Memory Leaks

**Diagnosis:**
```bash
pm2 monit
node --inspect dist/index.js
```

**Solutions:**
- Update to latest Node.js
- Review event listeners (remove when done)
- Use connection pooling
- Restart periodically with PM2 cron

### Database Connection Issues

**Check:**
```bash
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

**Solutions:**
- Verify credentials
- Check SSL settings
- Increase connection pool
- Check firewall rules

---

## 📚 Resources

- **PM2 Docs:** https://pm2.keymetrics.io/
- **Docker Best Practices:** https://docs.docker.com/develop/dev-best-practices/
- **PostgreSQL Performance:** https://wiki.postgresql.org/wiki/Performance_Optimization
- **Node.js Production:** https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

---

**Ready for Production! 🚀**

**Deployment Version:** 2.0  
**Last Updated:** February 2026

