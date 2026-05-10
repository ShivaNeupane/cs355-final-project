# Expense Sharing App

A full-stack expense sharing web application inspired by Splitwise.  
Users can create groups, add members, track shared expenses, and calculate balances between members.

## Features

-   User registration and login
-   Secure JWT authentication
-   Password hashing using bcrypt
-   Create and manage groups
-   Add, edit, and delete expenses
-   Automatic balance calculation
-   Responsive mobile-friendly UI
-   Progressive Web App (PWA) support
-   Installable web application
-   PostgreSQL database using Neon
-   Deployed on Render

---

## Tech Stack

### Frontend

-   HTML
-   CSS
-   JavaScript

### Backend

-   Node.js
-   Express.js

### Database

-   PostgreSQL (Neon)

### Authentication & Security

-   JWT (jsonwebtoken)
-   bcrypt

### Progressive Web App (PWA)

- Web App Manifest
- Service Workers

### Deployment

-   Render

---

## Project Structure

```txt
client/
  css/
  js/
  pages/

public/
  icons/
  js/
  manifest.json
  service-worker.js

server/
  config/
  controllers/
  middleware/
  routes/
```

---

## Installation

### Clone the repository

```bash
git clone <your-github-repo-url>
cd expense-sharing-app
```

### Install dependencies

```bash
npm install
```

### Create Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

### Run the project

```bash
npm run dev
```

Server runs on

```
http://localhost:5000
```
