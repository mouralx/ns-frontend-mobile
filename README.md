# ns-frontend-mobile

React Native + Expo mobile app for Massage Booking Application.

## Tech Stack
- **Framework:** React Native + Expo SDK 52
- **Navigation:** Expo Router v4 (file-based routing)
- **State:** Zustand (lightweight stores)
- **Styling:** NativeWind v4 (Tailwind CSS for RN)
- **API:** Axios + React Query (caching, retry, background refetch)
- **Forms:** React Hook Form + Zod (validation shared with backend)
- **Calendar:** react-native-calendars
- **Notifications:** expo-notifications

## Project Structure
```
app/
  _layout.tsx          # Root layout (QueryClient, auth init)
  index.tsx            # Entry redirect (auth check)
  +not-found.tsx       # 404 screen
  auth/
    _layout.tsx        # Auth stack layout
    login.tsx          # Login screen
    register.tsx       # Registration screen
  client/
    _layout.tsx        # Client tab navigator
    index.tsx          # Services list (home)
    booking-date.tsx   # Calendar date picker
    booking-slots.tsx  # Available time slots
    booking-confirm.tsx # Booking review & confirm
    appointments.tsx   # My appointments list
    appointment-detail.tsx # Appointment detail + actions
    notifications.tsx  # Notification inbox
    profile.tsx        # User profile
  therapist/
    _layout.tsx        # Therapist tab navigator
    schedule.tsx       # Today's schedule
    availability.tsx   # Working hours management
    walkin.tsx         # Walk-in booking form
    at-risk.tsx        # Unconfirmed appointments
src/
  types/index.ts       # TypeScript domain types
  services/            # API client modules
  stores/              # Zustand state stores
  hooks/useApi.ts      # React Query hooks
```

## Setup

### Prerequisites
- Node.js 18+
- npm

### Install

> **Note:** Use `--legacy-peer-deps` due to `react-native-worklets` peer dep conflict with RN 0.76.

```bash
git clone https://github.com/mouralx/ns-frontend-mobile.git
cd ns-frontend-mobile
npm install --legacy-peer-deps
```

### Run

```bash
# Web (works on any OS — no simulator needed)
npx expo start --web

# iOS (requires macOS + Xcode)
npx expo start --ios

# Android (requires Android Studio + emulator)
npx expo start --android
```

### Type Check & Lint

```bash
npx tsc --noEmit       # TypeScript — should pass with 0 errors
npm run lint            # ESLint 9 — should pass with 0 errors
```

## Environment

Create a `.env` file or set the following:

```
EXPO_PUBLIC_API_URL=https://api.massagebooking.com/v1
```

## License

Private
