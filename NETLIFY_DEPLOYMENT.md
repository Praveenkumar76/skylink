# Netlify Deployment Guide

## Prerequisites
- Netlify account
- Your project connected to a Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables Setup

Before deploying, you need to set these environment variables in your Netlify dashboard:

### Required Environment Variables:
1. **DATABASE_URL** - Your PostgreSQL database connection string
2. **NEXT_PUBLIC_SUPABASE_URL** - Your Supabase project URL
3. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Your Supabase anonymous key
4. **SUPABASE_SERVICE_ROLE_KEY** - Your Supabase service role key
5. **JWT_SECRET** - A secure random string for JWT token signing
6. **NEXT_PUBLIC_APP_URL** - Your Netlify app URL (e.g., https://your-app-name.netlify.app)

## Deployment Steps

### 1. Connect Your Repository
1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose your Git provider and select your repository
4. Set the build command: `npm run build`
5. Set the publish directory: `out`

### 2. Configure Environment Variables
1. In your site's dashboard, go to "Site settings" > "Environment variables"
2. Add each environment variable from the list above
3. Make sure to set them for "Production" and "Deploy previews"

### 3. Deploy
1. Netlify will automatically build and deploy your site
2. The first build might take a few minutes
3. You'll get a unique Netlify URL for your site

### 4. Custom Domain (Optional)
1. Go to "Domain management" in your site dashboard
2. Add your custom domain
3. Configure DNS settings as instructed

## Important Notes

- **Static Export**: This project is configured for static export, which means it will work as a static site
- **API Routes**: Since this is a static export, API routes won't work. You'll need to deploy your backend separately or use Netlify Functions
- **Database**: Ensure your database is accessible from Netlify's servers
- **Supabase**: Make sure your Supabase project allows connections from your Netlify domain

## Troubleshooting

### Build Errors
- Check that all environment variables are set correctly
- Ensure Node.js version 18 is used (specified in .nvmrc)
- Check the build logs in Netlify dashboard

### Runtime Errors
- Verify all environment variables are accessible
- Check browser console for client-side errors
- Ensure your database and Supabase are properly configured

## Support
If you encounter issues, check the Netlify build logs and ensure all environment variables are properly configured.
