# 👓 GetChasma — Luxury Optical E-Commerce Platform

> Next-generation omnichannel eyewear platform featuring an interactive 3D studio, real-time lens simulator, automated order fulfillment, smart returns, and executive admin analytics.

---

## ✨ Key Features

### 🛍️ Storefront (Customer Experience)
* **Interactive 3D Hero Studio:** Dynamic mouse-tracking 3D floating glasses powered by Framer Motion physics springs.
* **Smart Eyewear Catalog:** Real-time search, category filtering (Eyeglasses, Sunglasses, Computer Glasses), and Deals of the Day countdowns.
* **Optical Lab Simulator:** Interactive lens technology tester for Photochromic UV tinting, Zeiss BluCut shields, and anti-glare coatings.
* **Prescription Lens Customizer:** Seamless single-vision, bifocal/progressive, and computer power selection.
* **Indian Payment Gateway Ready:** UPI (GPay, PhonePe, Paytm), Credit/Debit Card, Net Banking, and Cash on Delivery (COD) in INR (₹).
* **Order Tracking & Returns:** 5-stage milestone tracking timeline, automated cancellation locks after shipping, and smart return/refund request workflow.

### ⚙️ Admin Command Center
* **Executive Dashboard:** Live KPIs for Gross Revenue, Total Orders, Active Catalog Items, and Low-Stock warnings.
* **Order Management & Fulfillment:** Step-by-step order processing (`Pending` → `Processing` → `Shipped` → `Delivered`) with strict delivery lock protection.
* **Return & Replacement Center:** Review customer requests, inspect uploaded proof, approve/deny with custom notes, and trigger source or COD refunds.
* **Product & Inventory Engine:** Full CRUD capabilities with high-res image galleries, discount tags, and specs manager.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, Tailwind CSS v4, HeroUI, Framer Motion, Lucide React
* **Backend:** Node.js, Express 5, CORS, Persistent JSON Transactional Database
* **Deployment:** Unified single-server architecture ready for Render, Railway, or Vercel

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Run Local Development Servers
In two separate terminals:
```bash
# Terminal 1: Start Backend API (Port 5001)
cd backend && node server.js

# Terminal 2: Start Frontend Dev Server (Port 5173)
cd frontend && npm run dev
```

### 3. Production Build & Run (Single Port)
```bash
npm run build
npm start
```
Open `http://localhost:5001` in your browser.
