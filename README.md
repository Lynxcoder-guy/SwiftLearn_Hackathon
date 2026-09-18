<h1 align="center">SwiftLearn</h1>
 
<p align="center">
  <em>Learn and take quizzes effectively — completely free, no paid subscription.</em>
</p>
<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/USER/Swiftlearn_Hackathon" alt="License"></a>
</p>
---
 
## What it does
 
SwiftLearn is an educational website that helps students learn subjects and
test themselves through quizzes, without any paywall. It's built around three
core tools that work together to help you study smarter, not longer.
 
**[Live demo →](https://swiftlearn-hackathon.shalbia549.workers.dev/)**
 
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
Hackathon_1/                     # package name: "swiftlearn"
├── .env.local.example
├── .gitignore
├── eslint.config.js
├── index.html                   # Vite entry (mounts /src/main.jsx, SwiftLearn favicon)
├── vite.config.js
├── package.json
├── package-lock.json
├── LICENSE
├── README.md
├── dev_err.txt                  # dev-server logs (working files)
├── dev_log.txt
├── dev_out.txt
├── desktop.ini
├── public/                      # static assets served at /
│   ├── favicon.svg
│   └── icons.svg
├── dist/                        # build output (vite build)
│   ├── index.html
│   ├── favicon.svg
│   ├── icons.svg
│   └── assets/
└── src/
    ├── main.jsx                 # React entry / createRoot
    ├── App.jsx                  # Router + all route definitions
    ├── App.css                  # global + page-transition styles
    ├── index.css                # base/global styles
    ├── firebase.js              # Firebase config and helpers
    ├── todo                     # notes file (no extension)
    ├── assets/                  # app images/logos
    │   └── SwiftLearn Favicon.svg
    ├── Audio/                   # sound + music feature
    │   ├── Alarm.mp3
    │   ├── AlarmSound.js
    │   ├── Lofi1.mp3
    │   ├── LofiMusic.js
    │   └── MusicButton.jsx
    ├── Auth_Components/         # page views: onboarding / auth
    │   ├── Welcome.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   └── welcome.css
    ├── Dash_Components/         # page views: dashboard
    │   ├── Dashboard.jsx
    │   ├── Dashboard.css
    │   └── DashTimer.jsx
    ├── JavaScript calculations/ # pure logic (note: real folder has a space)
    │   ├── Clynx.js
    │   ├── ClynxBlurt.js
    │   └── ScoreGamify.js
    ├── Scope_components/        # feature: Scope (blurting / revision method)
    │   ├── BlurtCon.jsx
    │   ├── Timer.jsx
    │   ├── RewriteBlurt.jsx
    │   ├── ReviewBlurt.jsx
    │   ├── BlurtAccuracy.js
    │   └── Scope.css
    └── Swift_components/        # feature: Swift (quiz method)
        ├── SwiftCon.jsx
        ├── SwiftQuiz.jsx
        ├── ReviewSwift.jsx
        ├── Swift.css
        └── SwiftMaterials/      # content/data + engine
            ├── SwiftSubjects.json
            ├── MathQuiz.json
            └── QuizEngine.js

```
 
*(Adjust this to match your actual folder layout.)*
 
## Roadmap
 
- [x] SWIFT learning tool
- [x] SCOPE memorization AI
- [x] CLYNX study-time ranking
- [x] Mobile app
- [ ] Leaderboards
- [ ] Offline quiz mode
## Contributing
 
Contributions are welcome.
 
1. Fork the repo and create a branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Open a pull request describing what changed and why
## License
 
Licensed under the Apache License 2.0.

## Bugs
Blurt Accuracy cant spot small inaccuracy and only analyze one paragraphs.

