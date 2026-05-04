# 🌿 FoodShare — Food Waste Reduction & Sharing Platform

A **production-quality** frontend web app built with **React + Tailwind CSS** featuring a stunning Glassmorphism design. Connect surplus food donors with people in need and help reduce food waste in your community.

![FoodShare](https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80)

## ✨ Features

### 🎨 UI/Design
- **Glassmorphism** — `backdrop-blur`, transparency layers, gradient borders
- Dark deep-navy theme with floating gradient orbs
- Google Fonts (Inter + Outfit), smooth micro-animations
- Fully **responsive** — mobile-first design

### 📄 Pages
| Page | Features |
|---|---|
| **Home** | Animated hero, live stat counters, food grid, how-it-works, testimonials |
| **Browse** | Real-time search + category filters + sort, skeleton loaders |
| **Food Detail** | Image click-to-zoom, expiry warnings, request + confirm modals |
| **Donate** | 3-step form, drag-drop image upload, real-time validation |
| **Request Food** | Urgency levels, dietary restrictions, inline validation |
| **Auth** | Login/Register toggle, password strength meter, one-click demo fill |
| **Profile** | Editable fields, Donations/Requests/Impact tabs, badges |
| **Payment** | 3D card flip, auto Visa/MC detection, order summary, success animation |

### 🧠 UX Interactions
- ⚡ Skeleton loaders on every data fetch (500–1200ms simulated API)
- 🔔 Toast notifications (success/error) on every action
- 🌊 Ripple effect on every button click
- ✅ Real-time form validation (not just on submit)
- 💾 localStorage persistence — data survives refresh

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/Mrvishwass/food-waste-reduction-system.git
cd food-waste-reduction-system

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Demo Login
> Click the **blue hint box** on the login page to auto-fill credentials, or use:
- **Email:** `alex@foodshare.com`
- **Password:** `password123`

## 🏗️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 8 | Build tool |
| Tailwind CSS | 3 | Styling |
| react-router-dom | 6 | Routing |
| react-hot-toast | latest | Toast notifications |
| lucide-react | 1.14 | Icons |
| framer-motion | latest | Animations |

## 📁 Project Structure

```
src/
├── components/
│   ├── food/         # FoodCard component
│   ├── layout/       # Navbar, Footer
│   └── ui/           # Button, Input, Modal, Skeleton
├── context/          # AuthContext (global auth state)
├── data/             # storage.js — localStorage + fake API
├── hooks/            # useHelpers.js — custom hooks
└── pages/            # All page components
    ├── HomePage.jsx
    ├── BrowsePage.jsx
    ├── FoodDetailPage.jsx
    ├── DonatePage.jsx
    ├── RequestPage.jsx
    ├── ProfilePage.jsx
    ├── AuthPage.jsx
    └── PaymentPage.jsx
```

## 💡 How It Works

The app uses **localStorage** to simulate a backend:
- 8 pre-seeded food listings from Bangalore
- Users, food items, and requests all persist across refreshes
- Fake API delays (500–1200ms) to simulate real network latency

## 📸 Screenshots

### Home Page
Animated hero section with food cards and community stats.

### Browse Page  
Filter by category, search by keyword, sort by recency or expiry.

### Payment Page
3D card preview that flips on CVV focus, auto-detects Visa/Mastercard.

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first.

## 📄 License

MIT License — free to use and modify.

---

Made with ❤️ to reduce food waste and feed communities.
