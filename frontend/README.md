# Claw Shield Frontend

Beautiful authentication UI with shader effects integrated with the backend API.

## Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment:
The `.env.local` file is already configured with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Features

- ✅ Beautiful login page with shader ripple effects
- ✅ Dark/Light mode toggle
- ✅ Integrated with backend JWT authentication
- ✅ Token management (access + refresh tokens)
- ✅ Protected routes ready
- ✅ TypeScript support
- ✅ Tailwind CSS styling

## Pages

- `/` - Landing page
- `/login` - Login page with shader effects
- `/signup` - Signup page (to be created)
- `/dashboard` - Protected dashboard (to be created)

## Authentication Flow

1. User enters credentials on login page
2. Frontend calls `POST /api/auth/login`
3. Backend returns access token (15m) + refresh token (7d)
4. Tokens stored in localStorage + cookies
5. Access token sent with protected requests
6. Auto-refresh when access token expires

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Radix UI components
- Three.js (shader effects)
- Lucide icons
