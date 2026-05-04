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
git clone https://github.com/supriya-poojary/Food-waste-reduction-and-sharing-platform.git
cd Food-waste-reduction-and-sharing-platform

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the root directory and add:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret

# Start the development server (Frontend + Backend)
npm run start
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| react-router-dom | Routing |
| framer-motion | Animations |

### Backend
| Technology | Purpose |
|---|---|
| Node.js & Express.js | Server environment & API |
| MongoDB & Mongoose | Database & Object Data Modeling |
| Socket.io | Real-time Communication |
| JWT & Bcrypt | Authentication & Security |

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

The platform operates using a modern full-stack architecture:
1. **Frontend**: Built with React and Tailwind CSS, providing a responsive, interactive user interface with a glassmorphism design.
2. **Backend API**: A Node.js and Express.js server handles routing, business logic, and secure API endpoints.
3. **Database**: MongoDB persistently stores user profiles, food donations, and requests using Mongoose schemas.
4. **Real-time Updates**: Socket.io enables live updates and real-time communication between donors and receivers.
5. **Authentication**: Secure user authentication is implemented using JSON Web Tokens (JWT) and bcrypt for password hashing.

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

---

## 👨‍💻 Author

- **GitHub:** [supriya-poojary](https://github.com/supriya-poojary)
