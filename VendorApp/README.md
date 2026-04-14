# VendorApp - AutoServe Vendor Portal

A dedicated, modern vendor management platform for AutoServe service providers. Built with React + Vite, designed specifically for vendors to manage bookings, track earnings, and maintain their service profiles.

## Features (Planned)

- **Authentication**: Secure vendor login with session-based auth
- **Dashboard**: Real-time stats (total bookings, active jobs, revenue)
- **Bookings**: View and manage service requests
- **Profile**: Manage vendor information and service details
- **Live Tracking** (Planned): Real-time location and ETA tracking
- **Payments** (Planned): Track earnings and payment history
- **Ratings** (Planned): Customer reviews and performance metrics

## Tech Stack

- **Frontend**: React 18, Vite, React Router
- **State Management**: React Context + React Query
- **API Client**: Axios with cookie-based sessions
- **Styling**: CSS3 with responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Backend server running on `http://localhost:8002`

### Installation

```bash
cd VendorApp
npm install
```

### Development

```bash
npm run dev
```

Opens on `http://localhost:5174`

### Build

```bash
npm run build
```

Generates optimized production build in `dist/`

## Project Structure

```
VendorApp/
├── src/
│   ├── pages/          # Page components (Login, Dashboard, Bookings, Profile)
│   ├── components/     # Reusable components (Layout, ProtectedRoute)
│   ├── context/        # React Context (AuthContext)
│   ├── services/       # API service layer
│   ├── styles/         # CSS stylesheets
│   ├── App.jsx         # Main app with routing
│   └── main.jsx        # Entry point
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies
├── .env.example        # Environment variables template
└── README.md           # This file
```

## Environment Variables

Create a `.env` file from `.env.example`:

```env
VITE_API_URL=http://localhost:8002/api/v1
VITE_NODE_ENV=development
```

## API Integration

The app uses a dedicated `AuthContext` that handles:

- **Vendor login/logout**: `/vendor/login`, `/vendor/logout`
- **Session validation**: `/vendor/@me`
- **Booking management**: `/bookings/vendor`
- **Profile updates**: `/vendor/profile`

All API calls include `credentials: 'include'` for cookie-based session auth.

## Authentication Flow

1. Vendor visits `/vendor-login`
2. Enters email and password
3. Backend validates and returns JWT tokens in cookies
4. AuthContext validates session via `/vendor/@me`
5. Protected routes check `actor === 'VENDOR'`
6. Logout clears all cookies

## Planned Enhancements

- [ ] Notifications & messaging
- [ ] Real-time booking alerts
- [ ] Payment/earnings dashboard
- [ ] Document verification status
- [ ] Mobile-responsive improvements
- [ ] Dark mode support
- [ ] Service availability scheduler
- [ ] Customer ratings & reviews

## Testing Checklist

- [ ] User can login with valid credentials
- [ ] User is redirected to dashboard
- [ ] Dashboard loads vendor stats correctly
- [ ] Bookings list displays correctly
- [ ] Profile edit/save works
- [ ] Logout clears session and redirects to login
- [ ] Protected routes block unauthenticated access

## Known Issues

- None yet - this is the initial scaffold

## Support

For issues or questions, contact the AutoServe development team.
