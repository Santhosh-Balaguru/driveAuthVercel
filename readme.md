# Vercel Google Drive OAuth Server

## Endpoints

- `/api/auth`: Redirects user to Google OAuth login
- `/api/callback`: Handles Google callback, exchanges code for tokens, and displays tokens

## Setup

1. Create a Google OAuth client (type: Web App).
2. Add `https://<project>.vercel.app/api/callback` as the **Authorized redirect URI** in Google console.
3. Push this repo to GitHub.

## Deploy

1. Go to [vercel.com](https://vercel.com) and import the GitHub repo.
2. In project Settings > Environment Variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
3. Deploy → URLs will be: