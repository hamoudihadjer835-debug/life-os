<div align="center">

# 🌟 LifeOS — Personal Life Management Dashboard

### Your all-in-one productivity system to manage finances, projects, habits, and notes.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-7c6fcd?style=for-the-badge)](https://life-os-sigma-ivory.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/hamoudihadjer835-debug/life-os)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://lifeos-backend-rupv.onrender.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)

</div>

---

##  Overview

**LifeOS** is a full-stack personal life management dashboard built with the **MERN stack**. It helps you take control of your daily life by tracking your finances, managing projects with a Kanban board, building healthy habits, and organizing your notes — all in one beautiful, responsive interface.

> 💡 Built as a personal project to demonstrate full-stack development skills including REST API design, JWT authentication, real-time UI updates, and responsive design.

🔗 **Live App:** https://life-os-sigma-ivory.vercel.app  
🔗 **Backend API:** https://lifeos-backend-rupv.onrender.com  
🔗 **Source Code:** https://github.com/hamoudihadjer835-debug/life-os  

---

##  Features

###  Finance Tracker
- Add income & expense transactions with categories
- Interactive charts (bar + doughnut) powered by Chart.js
- Multi-currency support (USD, EUR, GBP, DZD, SAR)
- Budget goals with progress tracking
- CSV export for transaction history
- Filter by date, category, and type

###  Project Manager
- Kanban board with tasks (Todo → In Progress → Done)
- Task priorities (Low, Medium, High, Urgent)
- Due dates, labels, and tags per task
- Project statistics sidebar
- Responsive mobile overlay for sidebar

###  Habit Tracker
- Daily habit completion tracking with streaks
- Visual heatmap calendar (GitHub-style)
- Habit statistics and goal setting
- Category-based organization
- Best streak tracking

###  Notes
- Full CRUD with rich text content
- Pin important notes to top
- Color-coded notes (7 colors)
- Category and tag filtering
- Search across title and content

###  Profile & Settings
- Personal score based on daily performance
- Avatar color customization
- Dark/Light theme toggle
- Currency and week start preferences
- Notification preferences

###  Authentication
- JWT-based login & registration
- Secure password hashing with bcrypt
- Protected routes

---

##  Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI Framework |
| React Router v6 | Client-side routing |
| Chart.js + react-chartjs-2 | Data visualization |
| Axios | HTTP requests |
| Context API | State management (Auth, Theme, Notifications) |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| CORS | Cross-origin requests |

### Deployment
| Service | Purpose | URL |
|---------|---------|-----|
| Vercel | Frontend hosting | https://life-os-sigma-ivory.vercel.app |
| Render | Backend hosting | https://lifeos-backend-rupv.onrender.com |
| MongoDB Atlas | Cloud database | Paris (eu-west-3) |
| GitHub | Version control | https://github.com/hamoudihadjer835-debug/life-os |

---

##  Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- npm

### 1. Clone the repository
```bash
git clone https://github.com/hamoudihadjer835-debug/life-os.git
cd life-os
```

### 2. Setup the Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lifeos
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

Start the server:
```bash
node server.js
```

### 3. Setup the Frontend
```bash
cd client
npm install
npm start
```

The app will run on `http://localhost:3000`

---

##  Project Structure

```
life-os/
├── client/                     # React Frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.js       # Responsive navbar + hamburger menu
│       │   ├── Icons.js        # SVG icons library
│       │   └── FinanceChart.js
│       ├── context/
│       │   ├── AuthContext.js  # JWT auth state
│       │   ├── ThemeContext.js # Dark/light theme
│       │   └── NotificationContext.js
│       ├── pages/
│       │   ├── Dashboard.js    # Overview + daily score
│       │   ├── Finance.js      # Transactions + charts
│       │   ├── Projects.js     # Kanban board
│       │   ├── Habits.js       # Habit tracker + heatmap
│       │   ├── Notes.js        # Notes CRUD
│       │   ├── Profile.js      # User profile + settings
│       │   ├── Login.js
│       │   └── Register.js
│       ├── services/
│       │   └── api.js          # Axios instance + all API calls
│       ├── App.js
│       └── index.css           # Global styles + animations
│
└── server/                     # Express Backend
    ├── middleware/
    │   └── auth.js             # JWT verification middleware
    ├── models/
    │   ├── User.js
    │   ├── Transaction.js
    │   ├── Project.js
    │   ├── Habit.js
    │   └── Note.js
    ├── routes/
    │   ├── auth.js
    │   ├── finance.js
    │   ├── projects.js
    │   ├── Habits.js
    │   └── notes.js
    └── server.js
```

---

##  API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + get JWT token |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |

### Finance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/finance` | Get all transactions |
| POST | `/api/finance` | Add transaction |
| DELETE | `/api/finance/:id` | Delete transaction |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/tasks` | Add task |
| PATCH | `/api/projects/:id/tasks/:taskId` | Update task status |
| DELETE | `/api/projects/:id/tasks/:taskId` | Delete task |

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Get all habits |
| POST | `/api/habits` | Create habit |
| PATCH | `/api/habits/:id/toggle` | Toggle completion |
| DELETE | `/api/habits/:id` | Delete habit |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes |
| POST | `/api/notes` | Create note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

---

##  Deployment

| Service | URL |
|---------|-----|
| 🌍 Frontend (Vercel) | https://life-os-sigma-ivory.vercel.app |
| ⚙️ Backend (Render) | https://lifeos-backend-rupv.onrender.com |
| 🍃 Database (MongoDB Atlas) | Paris region — M0 Free |

---

##  Author

<div align="center">

**Hadjer Hamoudi**

[![GitHub](https://img.shields.io/badge/GitHub-hamoudihadjer835--debug-181717?style=for-the-badge&logo=github)](https://github.com/hamoudihadjer835-debug)

*Full-Stack Developer | Computer Science Student*

</div>

---

<div align="center">

** If you found this project useful, please give it a star!**

Made with 💜 using the MERN Stack

</div>
