<p align="center">
  <img src="assets/logo.png" alt="SwiftLearn logo" width="140">
</p>
<h1 align="center">SwiftLearn</h1>
 
<p align="center">
  <em>Learn and take quizzes effectively — completely free, no paid subscription.</em>
</p>
<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/USER/swiftlearn" alt="License"></a>
  <a href="https://swiftlearn.example.com"><img src="https://img.shields.io/badge/demo-live-brightgreen" alt="Live demo"></a>
</p>
---
 
## What it does
 
SwiftLearn is an educational website that helps students learn subjects and
test themselves through quizzes, without any paywall. It's built around three
core tools that work together to help you study smarter, not longer.
 
**[Live demo →](https://swiftlearn.example.com)**
 
## Features
 
| Feature | What it does |
|---------|--------------|
| **SWIFT** | The core learning tool — helps students approach and work through subjects effectively with step by step guidence and weakness tracking|
| **SCOPE** | An AI model that helps you memorize subject material |
| **CLYNX** | A formula that ranks and estimates how much study time you need per problems |
 
## Advantages
 
- Learn and memorize quickly using **SWIFT** and **SCOPE**
- Manage your study sessions with **CLYNX**
- Track progress and aim for your highest possible score
- No subscription, no paywall — free to use
## Tech stackss
 
| Layer | Technology |
|-------|-----------|
| Frontend | JavaScript, React (JSX) |
| Styling | CSS, Figma (design) |
| Backend | Firebase |
 
## Getting started
 
**Requirements:** Node.js 18+, npm, a Firebase project
 
```bash
git clone https://github.com/USER/swiftlearn.git
cd swiftlearn
npm install
```
 
Set up your Firebase config:
 
```bash
cp .env.example .env
```
 
Then fill in `.env` with your Firebase project's credentials:
 
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```
 
Run it locally:
 
```bash
npm run dev
```
 
Open http://localhost:5173 in your browser.
 
## Project structure
 
```
swiftlearn/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page views
│   ├── features/
│   │   ├── swift/
│   │   ├── scope/
│   │   └── clynx/
│   └── firebase/       # Firebase config and helpers
├── public/
└── assets/
```
 
*(Adjust this to match your actual folder layout.)*
 
## Roadmap
 
- [x] SWIFT learning tool
- [x] SCOPE memorization AI
- [x] CLYNX study-time ranking
- [ ] Mobile app
- [ ] Leaderboards
- [ ] Offline quiz mode
## Contributing
 
Contributions are welcome.
 
1. Fork the repo and create a branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Open a pull request describing what changed and why
## License
 
[MIT](LICENSE) © Your Name
