# 🧠 MoodManager HR+

**An AI-powered HR system to detect employee burnout and emotional disengagement using work behavior and real-time facial mood analysis.**

---

## 🚀 Overview

**MoodManager HR+** intelligently tracks employee well-being by analyzing:
- 👀 Facial expressions via webcam (real-time, consent-based)
- 📈 Work patterns like login times, idle behavior, typing speed
- 📊 Mood + burnout trends over time
- 🧠 HR suggestions powered by GPT or logic rules

> 🔒 Fully private and secure — no data stored without consent.

---

## 🌟 Key Features

| Feature | Description |
|--------|-------------|
| 🎥 Mood Detection | Face recognition (using `face-api.js`) to detect happy, sad, angry, stressed |
| 🧠 Burnout Scoring | Digital behavior analysis using mock logs or real input |
| 📊 Dashboard | View employee burnout, mood, risk level, and suggested HR actions |
| ⚠️ Quiet Quit Detector | Combines mood and behavior to flag disengaged employees |
| 🤖 GPT-4 Integration | Generates smart, empathetic HR responses |
| 📈 Trend Charts | Burnout/mood data over time (line chart via Chart.js) |
| 🔒 Consent-First Webcam Use | Mood check-in only via user permission |
| 🗂️ Data Storage | SQLite backend for mood + burnout history |
| 🔐 Firebase Auth (optional) | Login as HR/Admin with role-based access |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| 🖼️ Frontend | React, Tailwind CSS, Chart.js, face-api.js |
| 🔙 Backend | Flask (Python), SQLite, Flask-CORS |
| 📁 Data | CSV mock logs + real webcam mood |
| 🤖 Optional AI | GPT-4 API for HR suggestions |
| 🔐 Optional Auth | Firebase Authentication |

---
