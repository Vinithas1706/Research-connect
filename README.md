# RESEARCH CONNECT

A professional demo platform built with Node.js + Express and plain HTML/CSS/JS.

## Pages & Flow
1. **Landing Page (`/`)** — Top nav with "Research" link (left), Login/Register (right).
   Center hero, features section, and "How it works" — explains the project and its chatbox.
2. **Register (`/register.html`)** → on success redirects to Login.
3. **Login (`/login.html`)** → on success redirects to the Project Explorer.
4. **Project Explorer (`/projects.html`)** — protected page:
   - Top search box: type a domain (e.g. "Healthcare", "E-commerce") to find 2–3 matching demo projects.
   - Left panel: scrollable project cards.
   - Right panel: an Assistant Chatbox — click a project, then ask about its
     frontend / backend / database / platform, or ask for a general suggestion.
     (Uses built-in mock data — no external API key required.)

## Folder Structure
```
FINAL PROJECT/
├── server.js
├── package.json
├── .env.example
├── routes/
│   ├── authRoutes.js
│   └── chatRoutes.js        (optional real-AI chat endpoint, unused by default UI)
├── models/
│   └── userModel.js
├── data/
│   └── users.json
└── public/
    ├── index.html            (landing page)
    ├── login.html
    ├── register.html
    ├── projects.html         (project explorer + assistant chatbox)
    ├── css/
    │   ├── style.css
    │   ├── landing.css
    │   └── projects.css
    └── js/
        ├── login.js
        ├── register.js
        ├── projectData.js    (mock demo-project dataset)
        └── projects.js       (search + chatbox logic)
```


## Live Demos (new)
Every one of the 30 projects opens a **real, working mini app** (not a mockup):
click a project, press **Launch Live Demo**, watch the server boot animation, then use it:

| Domain | What runs inside the demo |
|---|---|
| E-commerce | Add to cart, qty +/-, free-delivery bar, flash-sale countdown, checkout confetti |
| Healthcare | Book appointment with slot + token, live ECG heartbeat, auto-updating vitals |
| Education | Timed quiz, streak + bonus points, live leaderboard, final score |
| Food Delivery | Menu, order total, live tracker with moving scooter + ETA countdown |
| Social Media | Live feed / real-time team chat with typing indicator / photo feed with double-tap like |
| Finance | Live stock chart, buy/sell portfolio, budget tracker |
| Travel | Search with moving plane/cab, results, boarding pass |
| Real Estate | Budget slider filter, favourites, visit booking, EMI / rent-split calculator |
| Fitness | Activity ring, live session timer + heart rate, weekly bars, water tracker |
| Entertainment | Video player, music player with equalizer, seat-selection ticket booking |

Demos run inside a sandboxed iframe (`allow-scripts` only). Fullscreen button + Esc to close.
The demo engine lives in `public/js/demos.js`.

## Setup Instructions

1. **Install Node.js** (v18 or above) if not already installed.

2. **Extract the zip** and open a terminal inside the `FINAL PROJECT` folder.

3. **Install dependencies:**
   ```
   npm install
   ```

4. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - (Optional) Add your Anthropic API key only if you want to use the
     real-AI `/api/chat` endpoint in `routes/chatRoutes.js` — not required
     for the default Project Assistant chatbox, which works fully offline.
   ```
   PORT=3000
   SESSION_SECRET=any_random_string
   ANTHROPIC_API_KEY=your_real_api_key_here
   ```

5. **Run the server:**
   ```
   npm start
   ```

6. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Usage Flow
1. Landing page → click **Register**
2. Create an account → redirected to **Login**
3. Login → redirected to **Project Explorer**
4. Search a domain (e.g. "Food Delivery") → 2-3 demo projects appear
5. Click a project card → Assistant Chatbox shows its tech stack
6. Ask the assistant things like "what frontend?", "suggest a platform", etc.
7. Click **Logout** to end session

## Notes
- User data is stored in `data/users.json` (simple file-based storage, good for demo purposes).
  For production, replace with a real database (MongoDB/MySQL/PostgreSQL).
- The Project Assistant chatbox uses fixed mock data — works fully offline, no API key needed.
- Session expires after 2 hours (configurable in `server.js`).

## Deploying (to get a live domain link)
You can deploy this free on:
- **Render.com** (easiest — connect GitHub repo, auto-deploy)
- **Railway.app**
- **Vercel** (needs slight serverless adjustment)
- **Cyclic.sh**

Just remember to set the environment variables (`SESSION_SECRET`, and optionally `ANTHROPIC_API_KEY`)
in the hosting platform's dashboard/settings.

