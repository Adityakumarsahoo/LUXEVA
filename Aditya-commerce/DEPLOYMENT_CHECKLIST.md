# Production Deployment Checklist

## Pre-Deployment Security Checklist

### ✅ Completed Security Improvements
1. **Authentication Security**
   - [x] Strong JWT secret implemented
   - [x] Password hashing with bcrypt
   - [x] Role-based access control
   - [x] Account status validation
   - [x] Rate limiting on authentication endpoints

2. **API Security**
   - [x] Helmet.js security headers
   - [x] CORS configuration with specific origins
   - [x] NoSQL injection protection
   - [x] XSS protection
   - [x] Parameter pollution protection
   - [x] Request body size limits

3. **Data Protection**
   - [x] Environment variables secured
   - [x] .env.example template created
   - [x] File upload validation
   - [x] Input validation middleware

4. **Infrastructure Security**
   - [x] Security middleware implemented
   - [x] Rate limiting and throttling
   - [x] Security event logging

### 🔧 Required Production Configuration

#### Environment Variables (Update in Production)
```env
# Critical - Change these in production
JWT_SECRET=generate_strong_random_string_here
ADMIN_EMAIL=your_production_admin_email@domain.com
ADMIN_PASSWORD=strong_unique_password_here
MONGODB_URI=your_production_mongodb_uri
CLOUDINARY_API_KEY=your_production_cloudinary_key
CLOUDINARY_SECRET_KEY=your_production_cloudinary_secret
CLOUDINARY_NAME=your_production_cloudinary_name
RAZORPAY_KEY_SECRET=your_production_razorpay_secret
RAZORPAY_KEY_ID=your_production_razorpay_id
STRIPE_SECRET_KEY=your_production_stripe_secret
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

#### SSL/TLS Configuration
1. **Obtain SSL Certificate**
   - Use Let's Encrypt for free certificates
   - Or purchase from trusted CA
   
2. **Configure HTTPS**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       # Security headers
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       add_header X-Frame-Options "DENY" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
       
       # Proxy to Node.js
       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Server Configuration
1. **Firewall Rules**
   ```bash
   # Allow only necessary ports
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP (for redirect)
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw enable
   ```

2. **Process Management**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start application
   pm2 start backend/server.js --name "ecommerce-api"
   
   # Setup startup script
   pm2 startup
   pm2 save
   ```

3. **Monitoring**
   ```bash
   # Install monitoring tools
   pm2 install pm2-logrotate
   pm2 monit
   ```

#### Database Security
1. **MongoDB Security**
   ```javascript
   // Enable authentication
   use admin
   db.createUser({
     user: "admin",
     pwd: "strong_password",
     roles: ["root"]
   })
   ```

2. **Regular Backups**
   ```bash
   # Backup script
   mongodump --uri="mongodb_uri" --out=/backup/$(date +%Y%m%d)
   ```

#### Frontend Deployment
1. **Build Optimization**
   ```bash
   cd frontend
   npm run build
   
   # Deploy to CDN (Cloudflare, AWS CloudFront)
   ```

2. **Content Security Policy**
   ```nginx
   add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com; connect-src 'self' https://api.razorpay.com https://api.stripe.com";
   ```

### 🚀 Deployment Steps

#### Step 1: Server Setup
1. Provision Ubuntu 22.04 LTS server
2. Update system packages: `sudo apt update && sudo apt upgrade`
3. Install Node.js 18+: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
4. Install Nginx: `sudo apt install nginx`
5. Install MongoDB: Follow official MongoDB installation guide

#### Step 2: Application Deployment
1. Clone repository: `git clone https://github.com/your-repo/ecommerce.git`
2. Install dependencies:
   ```bash
   cd backend && npm ci --only=production
   cd ../frontend && npm ci --only=production
   ```
3. Configure environment variables:
   ```bash
   cp backend/.env.example backend/.env
   nano backend/.env  # Edit with production values
   ```
4. Build frontend: `cd frontend && npm run build`

#### Step 3: SSL Certificate
1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```
2. Obtain certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
3. Auto-renewal: Certbot automatically sets up renewal

#### Step 4: Nginx Configuration
1. Create Nginx config:
   ```bash
   sudo nano /etc/nginx/sites-available/ecommerce
   ```
2. Add configuration from above
3. Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

#### Step 5: Start Application
1. Start backend with PM2:
   ```bash
   cd /path/to/ecommerce/backend
   pm2 start server.js --name "ecommerce-api"
   ```
2. Deploy frontend build:
   ```bash
   sudo cp -r /path/to/ecommerce/frontend/dist/* /var/www/html/
   ```

### 📊 Monitoring & Maintenance

#### Logging
1. **Application Logs**
   ```bash
   pm2 logs ecommerce-api
   tail -f ~/.pm2/logs/ecommerce-api-out.log
   ```

2. **Nginx Logs**
   ```bash
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log
   ```

#### Performance Monitoring
1. **Server Resources**
   ```bash
   htop          # CPU/Memory
   nethogs       # Network
   iotop         # Disk I/O
   ```

2. **Application Metrics**
   - Use PM2 monitoring: `pm2 monit`
   - Implement New Relic or Datadog for advanced monitoring

#### Security Monitoring
1. **Regular Updates**
   ```bash
   # Weekly updates
   sudo apt update && sudo apt upgrade
   npm audit fix
   ```

2. **Security Scanning**
   ```bash
   # Install security scanner
   npm install -g snyk
   snyk test
   ```

3. **Intrusion Detection**
   - Install fail2ban: `sudo apt install fail2ban`
   - Configure for SSH and web attacks

### 🔄 Backup Strategy

#### Daily Backups
1. **Database Backup**
   ```bash
   # Daily MongoDB backup
   0 2 * * * mongodump --uri="mongodb_uri" --out=/backup/daily/$(date +\%Y\%m\%d)
   ```

2. **Application Backup**
   ```bash
   # Weekly full backup
   0 3 * * 0 tar -czf /backup/weekly/ecommerce-$(date +\%Y\%m\%d).tar.gz /path/to/ecommerce
   ```

3. **Backup Rotation**
   ```bash
   # Keep 7 daily, 4 weekly, 12 monthly backups
   find /backup/daily -type f -mtime +7 -delete
   find /backup/weekly -type f -mtime +28 -delete
   ```

### 🚨 Emergency Procedures

#### Incident Response
1. **Security Breach**
   - Isolate affected systems
   - Change all credentials
   - Restore from clean backup
   - Conduct security audit

2. **Performance Issues**
   - Scale horizontally: Add more instances
   - Optimize database queries
   - Implement caching (Redis)

3. **Data Loss**
   - Restore from latest backup
   - Investigate root cause
   - Implement additional safeguards

### 📈 Scaling Strategy

#### Vertical Scaling
1. **Upgrade Server**
   - Increase RAM
   - Add more CPU cores
   - Use SSD storage

2. **Database Optimization**
   - Add indexes
   - Implement read replicas
   - Use connection pooling

#### Horizontal Scaling
1. **Load Balancing**
   ```nginx
   upstream backend_servers {
       server 127.0.0.1:4000;
       server 127.0.0.1:4001;
       server 127.0.0.1:4002;
   }
   ```

2. **Session Management**
   - Use Redis for session storage
   - Implement JWT for stateless authentication

### 📞 Support & Maintenance

#### Regular Maintenance Tasks
- **Daily**: Check logs, monitor performance
- **Weekly**: Security updates, backup verification
- **Monthly**: Security audit, performance review
- **Quarterly**: Full security assessment

#### Contact Information
- **Technical Support**: support@yourdomain.com
- **Security Issues**: security@yourdomain.com
- **Emergency**: +1-XXX-XXX-XXXX

---
*Last Updated: 2026-05-09*
*Prepared by: Senior Full Stack MERN Developer & Security Expert*