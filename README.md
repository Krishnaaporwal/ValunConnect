# 🌍 VolunteerConnect

### 🐾 Team Meow | PS No. 4.3 – VolunteerCompass

A modern full-stack platform that intelligently connects volunteers with organizations through AI-based matching, location-aware discovery, and seamless event management.

---

## 🏆 Hackathon Details

* **Problem Statement:** PS No. 4.3 – VolunteerCompass
* **Team Name:** Team Meow 🐾

---

## ❗ Problem Statement

Community service is powerful, but highly unorganized.

* Volunteers struggle to find relevant opportunities
* NGOs and organizers rely on scattered platforms like WhatsApp
* Skilled volunteers remain unmatched while events stay understaffed

---

## 💡 Solution

**VolunteerConnect** bridges this gap by:

* 🎯 Matching volunteers with events using intelligent scoring
* 🗺️ Showing nearby opportunities via map-based discovery
* 🏢 Helping organizers manage events and volunteers efficiently
* 🚨 Highlighting urgent hiring needs
* 📊 Tracking volunteer impact and participation

---

## ⚙️ Tech Stack

### Frontend:

* Next.js (App Router)
* React.js
* TypeScript
* Tailwind CSS

### Backend:

* Next.js API Routes / Server Actions

### Database:

* NeonDB (Serverless PostgreSQL)

### ORM:

* Drizzle ORM

### Authentication:

* JWT / NextAuth (if used)

### Maps & APIs:

* Leaflet / Google Maps API

---

## 🏗️ Architecture Overview

The application follows a **modern full-stack serverless architecture**:

* **Frontend (Next.js)** → UI & user interaction
* **Backend (API Routes)** → business logic & APIs
* **Database (NeonDB)** → scalable PostgreSQL storage
* **ORM (Drizzle)** → type-safe database queries

---

## ✨ Features

### 👤 Volunteer Features

* 🔍 AI-based event recommendations
* 📊 Match percentage system
* 🗺️ Map-based nearby event discovery
* 📅 RSVP tracking (Pending / Accepted / Rejected)
* 📈 Impact stats (hours, events, categories)
* 🧠 Skill-based personalization

---

### 🏢 Organizer Features

* ➕ Create and manage events
* 🛡️ NGO verification system
* 👥 Volunteer selection dashboard
* 📊 Event analytics
* 🚨 Urgent hiring toggle

---

### 🚀 Advanced Features

* 🎯 Intelligent matching engine
* 🗺️ Location-based filtering
* 📢 Announcements system
* 💰 Conditional payment system (Private events only)

---

## 🧠 Matching Algorithm

matchScore = (
skillsMatch * 0.5 +
locationMatch * 0.2 +
interestMatch * 0.2 +
availabilityMatch * 0.1
)

### 📊 Match Categories:

* ✅ 75%+ → High Match
* ⚡ 40–75% → Medium Match
* ❌ <40% → Low Match

---

## 🗺️ Map Features

* 📍 Event markers based on location
* 🎨 Color-coded matches:

  * 🔴 High match
  * 🟡 Medium match
  * ⚪ Low match
* 🖱️ Click to view event details

---

## 🛡️ NGO Verification

* NGOs must provide a registration number
* Events can only be created after verification
* Prevents fake or untrusted listings

---

## 🚨 Urgent Hiring Feature

* Events marked as **Urgent 🚨**
* Shown at top of listings
* Helps fill last-minute volunteer needs

---

## 👥 Volunteer Selection System

### Organizer View:

* Volunteer profile
* Skills & experience
* Match percentage
* Total work hours

### Actions:

* ✅ Accept
* ❌ Reject

---

### Volunteer View:

* Application status updates
* RSVP tracking

---

## 👤 Volunteer Profile

Acts as a **digital portfolio**:

* Skills & interests
* Event participation history
* Total contribution time
* Recent projects

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-username/VolunteerConnect
cd VolunteerConnect
npm install
npm run dev
```

---

## 
* Landing Page
<img width="1912" height="915" alt="image" src="https://github.com/user-attachments/assets/4504ab29-e635-48e9-b897-dbe95e3ed658" />
<img width="1912" height="917" alt="image" src="https://github.com/user-attachments/assets/f2eb8fcb-730c-4c0b-adb2-6adf6f660edf" />
* Volunteer Dashboard
<img width="1907" height="912" alt="image" src="https://github.com/user-attachments/assets/96a3ceae-64f4-4fc5-bb3a-72058b581fb5" />
<img width="1878" height="905" alt="image" src="https://github.com/user-attachments/assets/bfccc8ef-785a-49ea-a01e-7b15fff00b21" />
<img width="1898" height="405" alt="image" src="https://github.com/user-attachments/assets/971c0b88-a871-42bb-8a3e-122553aed529" />
* Organizer Dashboard
<img width="1908" height="917" alt="image" src="https://github.com/user-attachments/assets/8c18b3d8-db04-4a41-8d7f-261502a7e36d" />
<img width="1900" height="911" alt="image" src="https://github.com/user-attachments/assets/f9c7a9c6-ad49-48c9-a5cf-77d1f1bb15c8" />
<img width="1896" height="912" alt="image" src="https://github.com/user-attachments/assets/caa3a484-7901-49e4-952d-570da70b2a8f" />



---

## 🧠 Architecture Highlight

We use a **modern serverless architecture** combining Next.js full-stack capabilities with NeonDB and Drizzle ORM, ensuring scalability, low latency, and efficient data handling without managing a separate backend server.

---

## 🔮 Future Scope

* 📱 Mobile application
* 🔔 Real-time notifications (WebSockets)
* 🤖 Advanced AI recommendations
* 🏆 Gamification (badges & rewards)
* 📧 Email alerts system

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repo and submit a PR.

---

## ⭐ Support

If you like this project, please ⭐ the repo!

---
