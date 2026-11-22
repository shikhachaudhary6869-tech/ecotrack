# EcoTrack – Smart Personal Carbon Footprint Tracker

A frontend-only React app for calculating, tracking and reducing your personal carbon footprint.
Built with HTML5, CSS3, JavaScript and React (Vite). Libraries: React Router DOM, Recharts, Lucide React.
No backend. All data is stored in the browser's LocalStorage.

## Run it

```bash
npm install
npm run dev        # open the printed URL (usually http://localhost:5173)
npm run build      # production build into dist/
```

Requires Node.js 18+ (only as the tool that runs the React dev server/build; the app itself has no backend).

## Project structure

```
src/
  components/   Navbar, Footer, Sidebar, AppLayout, StatCard, ChartCard, ActivityCard,
                ChallengeCard, ConfirmModal, Toaster, EmptyState
  pages/        Home, Login, Signup, Dashboard, Calculator, Challenges, EcoScore,
                Simulator, Reports, EcoTips, Profile
  context/      AuthContext (demo auth), EcoContext (records, challenges, tips, score, toasts)
  utils/        emissionFactors.js (editable factors), calculations.js, storage.js
  data/         challenges.js, ecoTips.js
  styles/       global.css, dashboard.css
  App.jsx, main.jsx
```

## Things to know (good for your viva)

- **Emission factors are illustrative estimates**, not certified values. Edit `src/utils/emissionFactors.js` and every calculation updates.
- **Authentication is a demo.** Passwords are stored in plain text in LocalStorage. This is NOT secure and must never be used in production.
- **EcoScore** (out of 100) = emissions points (60) + challenge points (25) + tip points (15). The formula is explained on the EcoScore page and in `calculateEcoScore()` in `calculations.js`. It is an educational score, not an official rating.
- **PDF report** uses the browser print dialog ("Save as PDF"); **CSV report** is generated with a Blob. Both run fully on the frontend.
- On an empty dashboard, use **Load sample data** to quickly see all charts populated.
- Data is per browser and per user account. Clearing browser data removes it.
