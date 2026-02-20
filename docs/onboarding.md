# User Onboarding Wizard

## Overview

The User Onboarding Wizard is a critical flow that ensures every user on MediaLinkPro has a complete profile before accessing the dashboard. It collects essential identity information, professional roles, and contact details.

## Features

-   **3-Step Wizard:**
    1.  **Identity:** Full Name, Username, Country, City, Avatar.
    2.  **Professional Profile:** Primary Role, Secondary Roles, Department, Experience.
    3.  **Socials & Contact:** LinkedIn, Portfolio, Website, Bio, Contact Preferences.
-   **Username Uniqueness:** Real-time server-side check to ensure unique usernames.
-   **Progress Tracking:** Visual progress bar indicating completion percentage.
-   **Route Gating:**
    -   Users with incomplete profiles are automatically redirected from `/dashboard` to `/onboarding`.
    -   Users with complete profiles are redirected from `/onboarding` back to `/dashboard`.
-   **Defensive Persistence:** Handles database writes safely even if some schema columns are missing (logs warnings instead of crashing).

## Technical Implementation

### Components

-   **`src/app/(app)/onboarding/page.tsx`**: Server Component that handles route gating and initial data fetching.
-   **`src/app/(app)/onboarding/_components/OnboardingWizard.tsx`**: Client Component managing the 3-step form state, validation, and UI.

### Server Actions (`src/features/profile/server/actions.ts`)

-   `getMyProfile()`: Fetches current user profile.
-   `checkUsernameAvailable(username)`: Checks if a username is taken.
-   `updateMyProfile(data)`: Updates profile fields.
-   `completeOnboarding(data)`: Finalizes the onboarding process.

### Validation (`src/features/profile/schema.ts`)

Uses **Zod** for schema validation:
-   `step1Schema`: Identity validation (min length, regex for username).
-   `step2Schema`: Role validation (enums).
-   `step3Schema`: URL validation and contact settings.

## Usage

The onboarding flow is triggered automatically for new users or existing users with incomplete profiles. Ensure the `profiles` table in Supabase has the required columns for full functionality, though the system will work gracefully with just `full_name` and `username`.
