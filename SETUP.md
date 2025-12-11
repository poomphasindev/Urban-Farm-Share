# Setup Guide: Connecting to Supabase

This guide will walk you through setting up your app to connect to Supabase and running the required SQL schema.

## Prerequisites

- Node.js installed (v18 or higher recommended)
- A Supabase account (sign up at [supabase.com](https://supabase.com) if you don't have one)

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in your project details:
   - **Name**: Choose a name for your project
   - **Database Password**: Create a strong password (save this securely!)
   - **Region**: Choose the region closest to you
5. Click "Create new project" and wait for it to be set up (this takes a few minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll find two important values:
   - **Project URL**: This is your `VITE_SUPABASE_URL`
   - **anon/public key**: This is your `VITE_SUPABASE_PUBLISHABLE_KEY`

## Step 3: Run the SQL Schema

1. In your Supabase project dashboard, click on **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the `supabase-schema.sql` file from this project
4. Copy the entire contents of the file
5. Paste it into the SQL Editor in Supabase
6. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
7. You should see a success message confirming all tables and policies were created

**What this SQL does:**
- Creates user roles (landowner, gardener)
- Sets up profiles table
- Creates urban farm spaces table
- Sets up space requests table
- Creates chat messages table
- Configures Row Level Security (RLS) policies
- Enables realtime for chat messages

## Step 4: Configure Environment Variables

1. Copy the `.env.example` file to create a `.env` file:
   ```bash
   # On Windows (Command Prompt)
   copy .env.example .env
   
   # On Windows (PowerShell)
   Copy-Item .env.example .env
   
   # On Mac/Linux
   cp .env.example .env
   ```

2. Open the `.env` file in a text editor

3. Replace the placeholder values with your actual Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   ```

   **Important**: Make sure there are no quotes around the values and no extra spaces.

## Step 5: Install Dependencies

If you haven't already, install the project dependencies:

```bash
npm install
```

## Step 6: Run the Application

Start the development server:

```bash
npm run dev
```

The app should now be running and connected to your Supabase database!

You can access it at the URL shown in the terminal (usually `http://localhost:5173`).

## Troubleshooting

### "Invalid API key" error
- Double-check that you copied the correct keys from Supabase
- Make sure there are no extra spaces or quotes in your `.env` file
- Verify you're using the **anon/public** key, not the service_role key

### "Failed to fetch" or connection errors
- Verify your `VITE_SUPABASE_URL` is correct
- Check that your Supabase project is active (not paused)
- Make sure you've run the SQL schema successfully

### SQL errors when running the schema
- If you see "relation already exists" errors, the tables may already be created. You can skip those errors or reset your database
- Make sure you're running the entire SQL file, not just parts of it
- Check that you have the necessary permissions in your Supabase project

### Environment variables not loading
- Make sure your `.env` file is in the root directory (same level as `package.json`)
- Restart your development server after changing `.env` values
- Verify the variable names start with `VITE_` (required for Vite)

## Next Steps

Once everything is set up:
1. Test the authentication by signing up a new user
2. Try creating a space as a landowner
3. Test the request flow as a gardener
4. Check that chat messages work in realtime

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- Check the console in your browser's developer tools for detailed error messages

