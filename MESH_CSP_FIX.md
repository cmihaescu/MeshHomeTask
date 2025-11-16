# Fixing the Mesh Connect CSP Error

## The Problem

You're seeing this error:
```
Framing 'https://sandbox-web.meshconnect.com/' violates the following Content Security Policy directive:
"frame-ancestors 'self' *.getfront.com *.meshconnect.com getfront.com meshconnect.com".
The request has been blocked.
```

This occurs because Mesh Connect's iframe has a Content Security Policy (CSP) that restricts which domains can embed it. Currently, only these domains are allowed:
- `'self'` (same origin as the iframe)
- `*.getfront.com` and `getfront.com`
- `*.meshconnect.com` and `meshconnect.com`

Your localhost is NOT in this list.

## Solutions

### Option 1: Add Your Domain to Mesh Connect Dashboard (RECOMMENDED)

1. Log in to your Mesh Connect dashboard at https://dashboard.meshconnect.com/
2. Navigate to **Settings** → **Integration Settings** or **Security Settings**
3. Look for **Allowed Origins** or **Trusted Domains**
4. Add your development URL:
   - For local development: `http://localhost:3000`
   - For production: your actual domain
5. Save the settings
6. Wait a few minutes for the changes to propagate
7. Try the widget again

### Option 2: Contact Mesh Connect Support

If you can't find the settings in the dashboard:

1. Contact Mesh Connect support at support@meshconnect.com
2. Request to add your domain to the allowed `frame-ancestors` list
3. Provide them with:
   - Your Client ID
   - The domain you want to whitelist (e.g., `http://localhost:3000`)
   - Whether you're using sandbox or production

### Option 3: Use a Proxy (Temporary Workaround)

This is not recommended for production but can work for development:

1. Set up a reverse proxy that makes requests appear to come from an allowed origin
2. This is complex and not recommended - use Options 1 or 2 instead

## Verification Steps

After adding your domain to Mesh Connect's allowed origins:

1. Clear your browser cache
2. Restart your development server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Navigate to `/mesh` in your app
4. Paste your link token (from Postman)
5. Click "Connect Wallet/Exchange"
6. The Mesh Connect modal should now open without CSP errors

## Additional Notes

- The CSP error is on Mesh Connect's side, not your application
- You cannot bypass this security feature from your code
- Each environment (localhost, staging, production) needs to be whitelisted separately
- Make sure you're using the correct sandbox/production credentials for your environment

## Current Setup

Your widget is now configured to:
- Accept link tokens via a text input
- Initialize the Mesh Connect SDK properly
- Handle success/error callbacks
- Display helpful error messages

Once the CSP issue is resolved, the widget will function properly!
