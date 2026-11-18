// Mock demo project data, grouped by searchable domain keywords.
// Each project has its own tech stack info used by the assistant chatbox.

const PROJECT_DATA = [
  {
    id: 'ecom-1',
    name: 'ShopEase',
    domain: ['ecommerce', 'e-commerce', 'shopping', 'retail'],
    description: 'A full-featured online shopping demo with cart, checkout, and order tracking.',
    frontend: 'React.js + Tailwind CSS',
    backend: 'Node.js + Express',
    database: 'MongoDB',
    platform: 'Vercel (frontend) + Render (backend)',
    tags: ['React', 'Node.js', 'MongoDB']
  },
  {
    id: 'ecom-2',
    name: 'QuickCart',
    domain: ['ecommerce', 'e-commerce', 'shopping', 'retail'],
    description: 'Lightweight e-commerce storefront with product search and payment gateway demo.',
    frontend: 'Vue.js + Bootstrap',
    backend: 'Django (Python)',
    database: 'PostgreSQL',
    platform: 'Netlify (frontend) + Railway (backend)',
    tags: ['Vue.js', 'Django', 'PostgreSQL']
  },
  {
    id: 'ecom-3',
    name: 'MartHub',
    domain: ['ecommerce', 'e-commerce', 'shopping', 'retail'],
    description: 'Multi-vendor marketplace demo with seller dashboard and product listings.',
    frontend: 'Next.js + Tailwind CSS',
    backend: 'Node.js + Express',
    database: 'MySQL',
    platform: 'AWS (EC2 + RDS)',
    tags: ['Next.js', 'Node.js', 'MySQL']
  },

  {
    id: 'health-1',
    name: 'MediCare Connect',
    domain: ['healthcare', 'health', 'medical', 'hospital'],
    description: 'Doctor appointment booking system with patient records dashboard.',
    frontend: 'React.js + Material UI',
    backend: 'Node.js + Express',
    database: 'MongoDB',
    platform: 'Render',
    tags: ['React', 'Node.js', 'MongoDB']
  },
  {
    id: 'health-2',
    name: 'HealthTrack',
    domain: ['healthcare', 'health', 'medical', 'hospital', 'fitness'],
    description: 'Patient vitals tracker with charts and medication reminders.',
    frontend: 'Angular + Bootstrap',
    backend: 'Spring Boot (Java)',
    database: 'PostgreSQL',
    platform: 'Heroku',
    tags: ['Angular', 'Spring Boot', 'PostgreSQL']
  },
  {
    id: 'health-3',
    name: 'PharmaGo',
    domain: ['healthcare', 'health', 'medical', 'pharmacy'],
    description: 'Online pharmacy demo with prescription upload and order tracking.',
    frontend: 'HTML/CSS/JavaScript',
    backend: 'PHP (Laravel)',
    database: 'MySQL',
    platform: 'cPanel Shared Hosting',
    tags: ['HTML/CSS/JS', 'Laravel', 'MySQL']
  },

  {
    id: 'edu-1',
    name: 'LearnSphere',
    domain: ['education', 'learning', 'school', 'elearning', 'e-learning'],
    description: 'Online course platform with video lessons, quizzes, and progress tracking.',
    frontend: 'React.js + Tailwind CSS',
    backend: 'Node.js + Express',
    database: 'MongoDB',
    platform: 'Vercel + Render',
    tags: ['React', 'Node.js', 'MongoDB']
  },
  {
    id: 'edu-2',
    name: 'ClassroomX',
    domain: ['education', 'learning', 'school', 'elearning', 'e-learning'],
    description: 'Virtual classroom demo with live attendance and assignment submission.',
    frontend: 'Vue.js + Vuetify',
    backend: 'Django (Python)',
    database: 'PostgreSQL',
    platform: 'Railway',
    tags: ['Vue.js', 'Django', 'PostgreSQL']
  },
  {
    id: 'edu-3',
    name: 'QuizMaster',
    domain: ['education', 'learning', 'school', 'quiz'],
    description: 'Quiz and exam platform with auto-grading and leaderboard.',
    frontend: 'Plain HTML/CSS/JavaScript',
    backend: 'Node.js + Express',
    database: 'SQLite',
    platform: 'Glitch / Replit',
    tags: ['HTML/CSS/JS', 'Node.js', 'SQLite']
  },

  {
    id: 'food-1',
    name: 'FoodFast',
    domain: ['food delivery', 'food', 'delivery', 'restaurant'],
    description: 'Food ordering demo with live order status and restaurant menu management.',
    frontend: 'React Native (mobile) + React.js (web)',
    backend: 'Node.js + Express',
    database: 'MongoDB',
    platform: 'AWS (EC2) + MongoDB Atlas',
    tags: ['React Native', 'Node.js', 'MongoDB']
  },
  {
    id: 'food-2',
    name: 'TastyTrack',
    domain: ['food delivery', 'food', 'delivery', 'restaurant'],
    description: 'Restaurant table booking and food pre-order demo app.',
    frontend: 'Flutter',
    backend: 'Firebase Functions',
    database: 'Firestore',
    platform: 'Firebase Hosting',
    tags: ['Flutter', 'Firebase', 'Firestore']
  },
  {
    id: 'food-3',
    name: 'CloudKitchen',
    domain: ['food delivery', 'food', 'delivery', 'restaurant'],
    description: 'Cloud kitchen order management dashboard for multiple outlets.',
    frontend: 'Next.js + Tailwind CSS',
    backend: 'Node.js + Express',
    database: 'PostgreSQL',
    platform: 'Vercel + Supabase',
    tags: ['Next.js', 'Node.js', 'PostgreSQL']
  },

  {
    id: 'social-1',
    name: 'ConnectSphere',
    domain: ['social media', 'social', 'networking'],
    description: 'Social networking demo with posts, likes, comments, and friend requests.',
    frontend: 'React.js + Tailwind CSS',
    backend: 'Node.js + Express + Socket.io',
    database: 'MongoDB',
    platform: 'Render + MongoDB Atlas',
    tags: ['React', 'Socket.io', 'MongoDB']
  },
  {
    id: 'social-2',
    name: 'ChatterBox',
    domain: ['social media', 'social', 'chat', 'messaging'],
    description: 'Real-time chat application demo with group chats and online status.',
    frontend: 'React.js',
    backend: 'Node.js + Express + Socket.io',
    database: 'Redis + MongoDB',
    platform: 'Railway',
    tags: ['React', 'Socket.io', 'Redis']
  },
  {
    id: 'social-3',
    name: 'PicShare',
    domain: ['social media', 'social', 'photo sharing'],
    description: 'Photo-sharing demo app with stories, likes, and explore feed.',
    frontend: 'Flutter',
    backend: 'Node.js + Express',
    database: 'Firebase Storage + Firestore',
    platform: 'Firebase Hosting',
    tags: ['Flutter', 'Firebase']
  },

  {
    id: 'finance-1',
    name: 'BudgetBuddy',
    domain: ['finance', 'banking', 'budget', 'money'],
    description: 'Personal finance tracker with expense charts and budget goals.',
    frontend: 'React.js + Chart.js',
    backend: 'Node.js + Express',
    database: 'PostgreSQL',
    platform: 'Render + Supabase',
    tags: ['React', 'Node.js', 'PostgreSQL']
  },
  {
    id: 'finance-2',
    name: 'PayWave',
    domain: ['finance', 'banking', 'payments'],
    description: 'Digital wallet and payment transfer demo with transaction history.',
    frontend: 'Angular + Bootstrap',
    backend: 'Spring Boot (Java)',
    database: 'MySQL',
    platform: 'AWS (EC2 + RDS)',
    tags: ['Angular', 'Spring Boot', 'MySQL']
  },
  {
    id: 'finance-3',
    name: 'InvestIQ',
    domain: ['finance', 'banking', 'investment', 'stocks'],
    description: 'Stock portfolio tracker demo with live-style charts and watchlists.',
    frontend: 'Next.js + Tailwind CSS',
    backend: 'Node.js + Express',
    database: 'MongoDB',
    platform: 'Vercel + Render',
    tags: ['Next.js', 'Node.js', 'MongoDB']
  },

  {
    id: 'travel-1',
    name: 'TripNest',
    domain: ['travel', 'tourism', 'booking', 'hotel'],
    description: 'Hotel & flight booking demo with itinerary planner and price comparison.',
    frontend: 'React.js + Tailwind CSS',
    backend: 'Node.js + Express',
    database: 'MongoDB',
    platform: 'Vercel + Render',
    tags: ['React', 'Node.js', 'MongoDB']
  },
  {
    id: 'travel-2',
    name: 'Wanderly',
    domain: ['travel', 'tourism', 'booking'],
    description: 'Travel blog & trip-sharing app demo with maps and photo galleries.',
    frontend: 'Vue.js + Bootstrap',
    backend: 'Django (Python)',
    database: 'PostgreSQL',
    platform: 'Railway',
    tags: ['Vue.js', 'Django', 'PostgreSQL']
  },
  {
    id: 'travel-3',
    name: 'CabGo',
    domain: ['travel', 'transport', 'booking', 'cab'],
    description: 'Cab booking demo app with live driver tracking and fare estimation.',
    frontend: 'Flutter',
    backend: 'Firebase Functions',
    database: 'Firestore',
    platform: 'Firebase Hosting',
    tags: ['Flutter', 'Firebase']
  },

  {
    id: 'realestate-1',
    name: 'HomeFinder',
    domain: ['real estate', 'property', 'housing'],
    description: 'Property listing demo with filters, map view, and agent contact.',
    frontend: 'Next.js + Tailwind CSS',
    backend: 'Node.js + Express',
    database: 'PostgreSQL',
    platform: 'Vercel + Supabase',
    tags: ['Next.js', 'Node.js', 'PostgreSQL']
  },
  {
    id: 'realestate-2',
    name: 'RentEasy',
    domain: ['real estate', 'property', 'rental'],
    description: 'Rental property management demo for landlords and tenants.',
    frontend: 'Angular + Bootstrap',
    backend: 'Spring Boot (Java)',
    database: 'MySQL',
    platform: 'AWS (EC2 + RDS)',
    tags: ['Angular', 'Spring Boot', 'MySQL']
  },
  {
    id: 'realestate-3',
    name: 'EstateView',
    domain: ['real estate', 'property', 'housing'],
    description: '3D virtual property tour demo with mortgage calculator.',
    frontend: 'React.js + Three.js',
    backend: 'Node.js + Express',
    database: 'MongoDB',
    platform: 'Render',
    tags: ['React', 'Three.js', 'Node.js']
  },

  {
    id: 'fitness-1',
    name: 'FitTrackr',
    domain: ['fitness', 'health', 'gym', 'workout'],
    description: 'Workout tracker demo with progress charts and routine planner.',
    frontend: 'React Native',
    backend: 'Node.js + Express',
    database: 'MongoDB',
    platform: 'Render + MongoDB Atlas',
    tags: ['React Native', 'Node.js', 'MongoDB']
  },
  {
    id: 'fitness-2',
    name: 'GymBuddy',
    domain: ['fitness', 'gym', 'workout'],
    description: 'Gym membership & class booking demo with trainer scheduling.',
    frontend: 'Vue.js + Vuetify',
    backend: 'Django (Python)',
    database: 'PostgreSQL',
    platform: 'Railway',
    tags: ['Vue.js', 'Django', 'PostgreSQL']
  },
  {
    id: 'fitness-3',
    name: 'NutriPlan',
    domain: ['fitness', 'health', 'nutrition', 'diet'],
    description: 'Diet & meal planning demo with calorie tracker.',
    frontend: 'Plain HTML/CSS/JavaScript',
    backend: 'Node.js + Express',
    database: 'SQLite',
    platform: 'Glitch / Replit',
    tags: ['HTML/CSS/JS', 'Node.js', 'SQLite']
  },

  {
    id: 'entertainment-1',
    name: 'StreamVerse',
    domain: ['entertainment', 'streaming', 'video', 'movies'],
    description: 'Video streaming demo with watchlists and recommendation rows.',
    frontend: 'React.js + Tailwind CSS',
    backend: 'Node.js + Express',
    database: 'MongoDB',
    platform: 'Vercel + Render',
    tags: ['React', 'Node.js', 'MongoDB']
  },
  {
    id: 'entertainment-2',
    name: 'EventBuzz',
    domain: ['entertainment', 'events', 'tickets'],
    description: 'Event discovery & ticket booking demo with seat selection.',
    frontend: 'Next.js + Tailwind CSS',
    backend: 'Node.js + Express',
    database: 'PostgreSQL',
    platform: 'Vercel + Supabase',
    tags: ['Next.js', 'Node.js', 'PostgreSQL']
  },
  {
    id: 'entertainment-3',
    name: 'MusicWave',
    domain: ['entertainment', 'music', 'streaming'],
    description: 'Music streaming demo with playlists and audio visualizer.',
    frontend: 'React.js + Web Audio API',
    backend: 'Node.js + Express',
    database: 'MongoDB',
    platform: 'Render',
    tags: ['React', 'Web Audio', 'MongoDB']
  }
];
