# MediaLinkPro-v2

Next.js SaaS application with Supabase integration.


## Status
- **Step 1**: Initial Setup (Done)
- **Step 2**: DB + RLS + Storage (Done)

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Setup**:
    - Copy `.env.example` to `.env.local`.
    - Fill in your Supabase credentials:
        - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
        - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon / Public Key
        - `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (Server only)
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Development

- **Linting**: `npm run lint`
- **Type Checking**: `npm run typecheck`
- **Formatting**: `npm run format`

## Architecture

- **Auth**: Supabase Auth (Email/Password)
- **Database**: Supabase Postgres
- **Styling**: Tailwind CSS + shadcn/ui
- **Routes**:
    - `/(public)`: Landing page
    - `/(auth)`: Login/Register
    - `/(app)`: Protected dashboard

## Key Features

- **User Onboarding Wizard**: 3-step profile setup with validation and route gating.
- **Middleware**: Automatically refreshes Supabase sessions and protects `/(app)` routes.
- **Strict Mode**: TypeScript strict mode enabled.
- **Env Validation**: Zod schema in `src/lib/env.ts` ensures environment variables are correct at runtime.

## Common Pitfalls

- **Service Role Key**: NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Use `src/lib/env.ts` to validate it only in server contexts if needed.
- **RLS**: Enable Row Level Security (RLS) on all Supabase tables immediately after creation.

