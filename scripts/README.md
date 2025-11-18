# Demo Seed Script

This script populates your local database with popular open-source repositories to make the feed look realistic for demos.

## Usage

1. **Get a JWT token:**
   - Sign in to your local app (http://localhost:3000)
   - Open browser DevTools → Application → Cookies
   - Copy the value of `next-auth.session-token`

2. **Run the seed script:**
   ```bash
   JWT_TOKEN="your-token-here" pnpm seed:demo
   ```

3. **Refresh the feed** at http://localhost:3000 to see the new projects

## What it does

- Creates projects for 20 popular repos (Next.js, React, VS Code, etc.)
- Calls the `/projects/from-github` API endpoint for each
- Adds a 1-second delay between requests to avoid rate limiting
- Reports success/failure count at the end

## Notes

- Requires GitHub OAuth to be configured in `.env`
- May fail if GitHub API rate limit is exceeded
- Projects will appear in the feed immediately after creation
