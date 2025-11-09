# 🍾 Bottles Ping

Bottles Ping connects people who want to recycle ("pinners") with local collectors who can pick up bottles for cash.  
Built with **React Native (Expo)** for the frontend and **Flask + AWS ECS + RDS + S3** for the backend.

---
## Live Demo
Since using the app requires api keys to google maps api you can't build locally without it.
Hence, you can try it out on your phone (iOS has most support). Expo Go app MUST be installed on your device prior to copy and pasting the following link to safari (should redirect and build via expo go app)
exp://fqphiwa-anonymous-8081.exp.direct

## 🚀 Quick Start (Frontend)

### 1️⃣ Install Expo CLI
If you don’t have Expo installed yet, run:
```bash
npm install -g expo-cli
```

### 2️⃣ Navigate to the frontend folder
```bash
cd frontend
```

### 3️⃣ Install dependencies
```bash
npm install
```

### 4️⃣ Start the Expo app (with tunnel mode for all WiFi networks)
```bash
npx expo start --tunnel
```

> ⚠️ **Tunnel mode** ensures the app works on any WiFi network (great for demos or mobile testing).  
> You can scan the QR code that appears with the **Expo Go app** on your phone.

---

## 🖥️ Backend Overview

The backend is built with **Flask**, deployed on **AWS ECS**, and connected to:
- **AWS RDS (PostgreSQL)** for user, submission, and location data.
- **AWS S3** for image storage.

You can find the backend API endpoints inside `app.py`, which handle:
- `/upload` → Uploads bottle photos and location.
- `/locations` → Retrieves active bottle locations.
- `/leaderboard` → Displays top recyclers.
- `/s3info` → Returns stored image and metadata.
- `/check_user` and `/add_user` → For login and registration.

---

## 📱 Features
- Upload photos of bottles with GPS location.
- See nearby pings on a live map.
- Collect recyclables and track your score.
- Leaderboard showing top recyclers.

---

## 🧰 Tech Stack
**Frontend:** React Native (Expo)  
**Backend:** Flask (Python)  
**Database:** PostgreSQL (AWS RDS)  
**Storage:** AWS S3  
**Deployment:** AWS ECS with Docker  

---

## 💡 Tip
If Expo fails to start, try clearing the cache:
```bash
npx expo start -c
```

---

## 👏 Contributors
Muhammad Ahmed
Saw Daniel Aung Khant Moe
Kevlam Chundawat
Syed Wasef Daiyan
Sultan Alzoghaibi
