# 🏢 Plaza Rent Management System

A complete Tenant Rent & Lease Management Web Application for commercial plazas.

## Features

- ✅ **Dashboard** - Overview of rent collection, outstanding, tenants
- ✅ **Tenant Management** - Add, edit, manage tenant profiles
- ✅ **Lease Management** - Track lease agreements, renewals, expirations
- ✅ **Rent Sheet** - Monthly rent generation with balance calculations
- ✅ **Payment Tracking** - Record payments with attachments
- ✅ **Tenant Ledger** - Complete payment history per tenant
- ✅ **WhatsApp Reminders** - Send rent reminders via WhatsApp
- ✅ **Reports** - Defaulters, outstanding, lease expiry reports
- ✅ **Settings** - Customize plaza info, templates, headers/footers
- ✅ **Mobile Responsive** - Works on all devices

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Free & Easy)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub/GitLab/Email

2. **Deploy via GitHub**
   ```bash
   # Push your code to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/plaza-rent-management.git
   git push -u origin main
   ```

3. **Connect to Vercel**
   - Go to Vercel Dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

4. **Or Deploy via CLI**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

---

### Option 2: Netlify (Free)

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up for free

2. **Deploy via Drag & Drop**
   ```bash
   # Build the project first
   npm run build
   ```
   - Go to Netlify Dashboard
   - Drag the `dist` folder to the deploy area
   - Your app is live!

3. **Or Deploy via CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

4. **Or Connect GitHub**
   - Push code to GitHub
   - In Netlify, click "New site from Git"
   - Select your repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

---

### Option 3: GitHub Pages (Free)

1. **Install gh-pages**
   ```bash
   npm install -D gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://YOUR_USERNAME.github.io/plaza-rent-management",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/plaza-rent-management/',
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

---

### Option 4: Cloudflare Pages (Free)

1. **Create Cloudflare Account**
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com)

2. **Connect GitHub Repository**
   - Click "Create a project"
   - Connect your GitHub account
   - Select your repository

3. **Configure Build**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Click "Save and Deploy"

---

### Option 5: Railway (Free Tier Available)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)

2. **Deploy**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

---

### Option 6: Firebase Hosting (Free)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```
   - Select "Use an existing project" or create new
   - Public directory: `dist`
   - Single-page app: `Yes`
   - Overwrite index.html: `No`

3. **Build & Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

---

### Option 7: Traditional Web Hosting (cPanel/Shared Hosting)

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Upload Files**
   - Upload contents of `dist` folder to `public_html` via FTP/cPanel File Manager

3. **Configure .htaccess** (for Apache)
   Create `.htaccess` in your hosting root:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

### Option 8: DigitalOcean App Platform

1. **Create DigitalOcean Account**
   - Go to [digitalocean.com](https://digitalocean.com)

2. **Create App**
   - Go to App Platform
   - Connect GitHub repository
   - Build command: `npm run build`
   - Output directory: `dist`
   - Deploy!

---

### Option 9: AWS Amplify

1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. **Initialize & Deploy**
   ```bash
   amplify init
   amplify add hosting
   amplify publish
   ```

---

### Option 10: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**
   ```nginx
   events {
     worker_connections 1024;
   }
   http {
     include mime.types;
     server {
       listen 80;
       root /usr/share/nginx/html;
       index index.html;
       location / {
         try_files $uri $uri/ /index.html;
       }
     }
   }
   ```

3. **Build & Run**
   ```bash
   docker build -t plaza-rent-app .
   docker run -p 80:80 plaza-rent-app
   ```

---

## 🔧 Environment Variables (Optional)

If you need to add backend API URL later:

1. Create `.env` file:
   ```
   VITE_API_URL=https://your-api.com
   ```

2. Access in code:
   ```typescript
   const apiUrl = import.meta.env.VITE_API_URL
   ```

---

## 📱 Demo Credentials

- **Admin**: admin / admin123
- **Owner**: owner / owner123
- **Accountant**: accountant / acc123

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📞 Support

For any deployment issues, create an issue on GitHub or contact support.

---

## 📄 License

MIT License - Free to use and modify.
