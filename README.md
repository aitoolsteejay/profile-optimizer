# Myntmore LinkedIn Profile Optimizer

Free LinkedIn profile clarity audit for professionals. See how a small shift in positioning can instantly increase replies, authority, and inbound pipeline.

## Getting started

Requires Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd myntmore-linkedin-profile-optimizer

# Install dependencies
npm i

# Start the development server
npm run dev
```

## What technologies are used for this project?

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (edge functions)

## Deployment

This project is set up for deployment on [Vercel](https://vercel.com). Connect the repository in the Vercel dashboard and set the required environment variables (see `.env` for the Supabase variables used by the frontend).

The Supabase edge functions (`supabase/functions/*`) are deployed separately via the Supabase CLI:

```sh
supabase functions deploy optimize-profile
supabase functions deploy get-leads
supabase functions deploy scrape-linkedin
```

The `optimize-profile` function requires a `GEMINI_API_KEY` secret set in the Supabase project (Settings > Edge Functions > Secrets).
