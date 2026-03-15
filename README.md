# Account Management System

Full Stack Account Management System with React, Node.js, Express, and Supabase.

## Setup

1. **Database Setup**
   - Create a project in [Supabase](https://supabase.com).
   - Go to the SQL Editor and run the queries found in `schema.sql`.
   - Go to Project Settings -> API and copy the `URL` and `anon key`.

2. **Backend Setup**
   - Navigate to the `backend` directory.
   - Open `backend/.env` and update the `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your project's credentials.
   - Run `npm install` (already done if using the setup script)
   - Run `npm start` (which runs `node server.js`).

3. **Frontend Setup**
   - Navigate to the `frontend` directory.
   - Run `npm install` (already done if using the setup script)
   - Run `npm run dev` to start the React development server.

## Features
- JWT Authentication
- Account Dashboard (Balance)
- Send Money Feature (Transfer to other users)
- Account Statement (Transaction history with colored badges)
- Premium, dynamic Vanilla CSS Design
