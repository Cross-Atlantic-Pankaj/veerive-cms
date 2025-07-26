# Veerive Backend - Vercel Deployment

This guide explains how to deploy the Veerive backend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **Environment Variables**: Prepare your production environment variables

## Environment Variables

Set these environment variables in your Vercel dashboard or via CLI:

```bash
# Database
DB_URL=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# Email Configuration
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password

# OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Other
NODE_ENV=production
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. **Push to GitHub**: Make sure your code is pushed to a GitHub repository

2. **Connect to Vercel**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set the root directory to `backend`
   - Configure environment variables
   - Deploy

### Option 3: Deploy via Vercel Dashboard

1. **Zip your backend folder** (excluding node_modules)
2. **Upload to Vercel dashboard**
3. **Configure environment variables**
4. **Deploy**

## Configuration Files

The following files are configured for Vercel deployment:

- **`vercel.json`**: Main Vercel configuration
- **`api/index.js`**: Serverless function entry point
- **`.vercelignore`**: Files to exclude from deployment
- **`package.json`**: Updated with Vercel-specific scripts

## Important Notes

### Serverless Limitations

1. **Function Timeout**: Maximum 30 seconds per request
2. **Memory Limit**: 1024MB on Hobby plan, configurable on Pro
3. **Cold Starts**: First request may be slower
4. **File System**: Read-only, no persistent storage

### Database Considerations

1. **Connection Pooling**: Use connection pooling for MongoDB
2. **Connection Limits**: Be aware of concurrent connection limits
3. **Timeouts**: Set appropriate database timeouts

### CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:3000` (User frontend)
- `http://localhost:3001` (Admin development)
- `https://veerive-oct7.vercel.app` (Staging)
- `https://veerive-frontend.vercel.app` (Production)

Update the `allowedOrigins` array in `api/index.js` to match your frontend URLs.

## Monitoring and Debugging

1. **Function Logs**: View in Vercel dashboard under "Functions" tab
2. **Real-time Logs**: Use `vercel logs` command
3. **Performance**: Monitor in Vercel dashboard

## Custom Domain (Optional)

1. **Add Domain**: In Vercel dashboard, go to "Domains"
2. **Configure DNS**: Point your domain to Vercel
3. **SSL**: Automatic SSL certificate provisioning

## Troubleshooting

### Common Issues

1. **Build Errors**: Check build logs in Vercel dashboard
2. **Environment Variables**: Ensure all required variables are set
3. **Import Errors**: Verify all file paths use `.js` extensions
4. **Database Connection**: Check MongoDB connection string and network access

### Performance Optimization

1. **Connection Reuse**: Implement connection pooling
2. **Caching**: Use appropriate caching strategies
3. **Bundle Size**: Keep dependencies minimal
4. **Cold Start Optimization**: Initialize connections outside handlers

## Support

For deployment issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review function logs in dashboard
3. Test locally with `vercel dev`

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] CORS origins updated
- [ ] OAuth callbacks updated (if using)
- [ ] Email configuration tested
- [ ] Custom domain configured (if needed)
- [ ] Monitoring set up 