# 📸 Instagram Clone — MERN Full Stack Social Media Platform

A full-stack Instagram-inspired social media application built using the **MERN stack**.
Users can create posts, like posts, add comments, and interact through a modern responsive UI.

This project demonstrates real-world full-stack development concepts including authentication, REST APIs, MongoDB relationships, protected routes, and modern React UI development.

---

## 🚀 Live Demo

🔗 Frontend: Coming Soon
🔗 Backend API: Coming Soon

---

# ✨ Features

## 🔐 Authentication

* User registration
* User login
* JWT-based authentication
* Protected API routes
* Secure password handling
* Persistent user sessions

---

## 📝 Posts

* Create new posts
* View all posts
* Display user information with posts
* Update own posts
* Delete own posts
* Like/unlike posts
* Dynamic like count

---

## ❤️ Like System

* Toggle like/unlike functionality
* Real-time UI update after liking
* Animated heart interaction using Framer Motion

---

## 💬 Comment System

* Add comments on posts
* View all comments
* Update own comments
* Instagram-style comment modal
* Auto-focus comment input
* Close modal with:

  * Close button
  * Outside click
  * Escape key

---

## 🎨 User Interface

* Responsive Instagram-inspired design
* Tailwind CSS styling
* Smooth animations
* Modern component-based architecture

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Framer Motion
* React Router
* Axios

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* REST APIs

## Tools

* Git & GitHub
* Postman
* VS Code

---

# 📂 Project Structure

```
Instagram_Clone
│
├── insta-backend
│   │
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── routers
│   ├── utilities
│   ├── index.js
│   └── package.json
│
└── insta-frontend
    │
    ├── src
    ├── public
    ├── package.json
    └── vite.config.js
```

---

# ⚙️ Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/Varshith-kummarikunta/instagram-clone.git

cd instagram-clone
```

---

# Backend Setup

Navigate to backend:

```bash
cd insta-backend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start backend:

```bash
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

# Frontend Setup

Open another terminal:

```bash
cd insta-frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🔌 API Endpoints

## Authentication

| Method | Endpoint         | Description   |
| ------ | ---------------- | ------------- |
| POST   | `/auth/register` | Register user |
| POST   | `/auth/login`    | Login user    |

---

## Posts

| Method | Endpoint              | Description      |
| ------ | --------------------- | ---------------- |
| GET    | `/posts`              | Get all posts    |
| POST   | `/posts`              | Create post      |
| POST   | `/posts/like/:postId` | Like/unlike post |
| PATCH  | `/posts/:postId`      | Update post      |
| DELETE | `/posts/:postId`      | Delete post      |

---

## Comments

| Method | Endpoint               | Description    |
| ------ | ---------------------- | -------------- |
| POST   | `/comments/:postId`    | Add comment    |
| GET    | `/comments/:postId`    | Get comments   |
| PATCH  | `/comments/:commentId` | Update comment |

---

# 🧠 Learning Outcomes

Through this project, I implemented:

* Full-stack MERN architecture
* JWT authentication flow
* Protected backend routes
* MongoDB schema relationships
* REST API design
* React component architecture
* State management
* Responsive UI development
* User interaction patterns used in real applications

---

# 📸 Screenshots

*Add application screenshots here*

Example:

```
screenshots/
 ├── login.png
 ├── feed.png
 ├── post-modal.png
 └── comments.png
```

---

# 🔮 Future Improvements

Planned features:

* [ ] Cloudinary image upload
* [ ] User profile pages
* [ ] Follow/unfollow system
* [ ] Infinite scrolling feed
* [ ] Real-time notifications using Socket.io
* [ ] Stories feature
* [ ] Search users and posts
* [ ] Saved posts
* [ ] Dark mode

---

# 👨‍💻 Author

**Varshith Kummarikunta**

B.Tech Computer Science Engineering (2025)

GitHub:
https://github.com/Varshith-kummarikunta

---

⭐ If you like this project, consider giving it a star!
