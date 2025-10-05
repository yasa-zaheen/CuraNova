# Onboarding System Setup

## Database Schema Update

Add these columns to your `users` table in Supabase:

```sql
-- Add new columns for onboarding information
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
ADD COLUMN IF NOT EXISTS insurance_id TEXT,
ADD COLUMN IF NOT EXISTS group_number TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
```

## How it works

1. **User Signup Flow**:

   - User signs up through Clerk
   - Webhook creates basic user record in Supabase with onboarding fields as NULL
   - `onboarding_completed` is set to FALSE

2. **Onboarding Redirect**:

   - OnboardingGuard component checks if user has completed onboarding
   - If not completed, redirects to `/onboarding` page
   - User fills out the beautiful onboarding form

3. **Onboarding Completion**:
   - Form data is sent to `/api/onboarding` endpoint
   - Updates user record with all the information
   - Sets `onboarding_completed` to TRUE
   - Redirects user to `/dashboard`

## Required Fields

- `phone_number` - User's contact phone number
- `street_address` - Street address
- `city` - City
- `state` - State/Province
- `zip_code` - ZIP/Postal code

## Optional Fields

- `insurance_provider` - Insurance company name
- `insurance_id` - Insurance ID number
- `group_number` - Insurance group number

## Features

✅ Futuristic dark UI with glass morphism effects  
✅ Form validation with required fields  
✅ Loading states and error handling  
✅ Automatic redirection after completion  
✅ Responsive design  
✅ Integration with existing Clerk authentication  
✅ Supabase database integration

## Testing

1. Create a new user account
2. After signup, you should be redirected to the onboarding page
3. Fill out the form and submit
4. You should be redirected to the dashboard
5. Next login should skip onboarding and go directly to the app

The onboarding page matches your futuristic design with gradients, glass effects, and the dark theme! 🚀
