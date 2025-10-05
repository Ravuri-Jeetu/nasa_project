# Hostingial Deployment Guide for NASA Research Analytics Platform

## 📋 **Prerequisites**

- Hostingial Deluxe plan (₹89/month)
- cPanel access
- File Manager or FTP access
- Python 3.9+ support (check with Hostingial support)

## 🎯 **Deployment Plan Overview**

1. **Frontend**: Static files in `public_html` directory
2. **Backend**: Python FastAPI in subdomain or subdirectory
3. **Domain**: Your free domain from GoDaddy
4. **Total Cost**: ₹89/month (your existing plan)

## 🌐 **Step 1: Prepare Frontend for Hostingial**

### **1.1 Build Frontend**
```bash
# Run the deployment script
cd cursor-front
./deploy-hostingial.sh  # Linux/Mac
# OR
deploy-hostingial.bat   # Windows
```

### **1.2 Upload Frontend Files**
1. **Login to cPanel**
2. **Open File Manager**
3. **Navigate to `public_html`**
4. **Upload all files** from `cursor-front/out/` directory
5. **Upload `.htaccess`** file to root of `public_html`

## 🐍 **Step 2: Deploy Backend to Hostingial**

### **2.1 Prepare Backend**
```bash
# Run the backend deployment script
cd cursor-back
./deploy-hostingial-backend.sh  # Linux/Mac
# OR
deploy-hostingial-backend.bat    # Windows
```

### **2.2 Upload Backend Files**
1. **Create subdomain**: `api.yourdomain.com` in cPanel
2. **Upload backend files** to the subdomain directory
3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### **2.3 Configure Backend**
1. **Set up Python app** in cPanel
2. **Configure startup command**: `python startup.py`
3. **Set environment variables**:
   - `PORT=8000`
   - `CORS_ORIGINS=https://yourdomain.com`

## 🔧 **Step 3: Configure Environment Variables**

### **3.1 Frontend Environment**
Create `.env.production` in your frontend:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NODE_ENV=production
```

### **3.2 Backend Environment**
Set in cPanel Python app settings:
```env
PORT=8000
CORS_ORIGINS=https://yourdomain.com
NODE_ENV=production
```

## 🌐 **Step 4: Configure Your Domain**

### **4.1 Point Domain to Hostingial**
1. **Go to GoDaddy** domain management
2. **Update DNS records**:
   - **A Record**: `@` → Hostingial server IP
   - **CNAME**: `www` → `yourdomain.com`
   - **CNAME**: `api` → `api.yourdomain.com`

### **4.2 SSL Certificate**
1. **Enable SSL** in cPanel
2. **Force HTTPS** redirect
3. **Update API URLs** to use HTTPS

## 🧪 **Step 5: Test Your Deployment**

### **5.1 Test Frontend**
- **Visit**: `https://yourdomain.com`
- **Check**: Pages load correctly
- **Verify**: Images and assets work

### **5.2 Test Backend**
- **Visit**: `https://api.yourdomain.com/docs`
- **Check**: FastAPI documentation loads
- **Test**: API endpoints work

### **5.3 Test Integration**
- **Check**: Frontend can connect to backend
- **Test**: AI chat functionality
- **Verify**: Paper analysis features work

## 🎉 **Your Live URLs**

### **With Your Domain:**
- **Frontend**: `https://yourdomain.com`
- **Backend API**: `https://api.yourdomain.com`
- **API Documentation**: `https://api.yourdomain.com/docs`

## 💰 **Cost Breakdown**

| Component           | Cost | Status                     |
|---------------------|------|----------------------------|
| **Domain**          | ₹0   | ✅ FREE (GoDaddy)          |
| **Hosting**         | ₹89  | ✅ Hostingial Deluxe       |
| **SSL Certificate** | ₹0   | ✅ FREE (Let's Encrypt)    |
| **Total**           | **₹89/month** | **🎉 AFFORDABLE**     |

## 🚀 **Next Steps**

1. **Run deployment scripts** to prepare files
2. **Upload frontend** to `public_html`
3. **Set up backend** subdomain
4. **Configure domain** DNS
5. **Test everything** thoroughly

## 🔧 **Troubleshooting**

### **Common Issues:**
- **Python not available**: Contact Hostingial support
- **File permissions**: Set 755 for directories, 644 for files
- **CORS errors**: Check backend CORS configuration
- **SSL issues**: Enable SSL in cPanel

### **Support:**
- **Hostingial Support**: 24x7 Live Support
- **Documentation**: Check Hostingial knowledge base
- **Community**: Hostingial user forums

## 🎯 **Benefits of Hostingial**

- ✅ **Affordable**: ₹89/month for full hosting
- ✅ **Reliable**: 99.95% uptime guarantee
- ✅ **Support**: 24x7 live support
- ✅ **Features**: cPanel, Python, Node.js support
- ✅ **Security**: Free SSL, daily backups
- ✅ **Performance**: NVMe storage, LiteSpeed server

**Your NASA Research Analytics Platform is ready for Hostingial deployment!** 🚀
