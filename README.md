# Expense Sharing App

A full-stack expense sharing web application inspired by Splitwise.  
Users can create groups, add members, track shared expenses, and calculate balances between members.

## Features

-   User registration and login
-   Secure JWT authentication
-   Password hashing using bcrypt
-   Create and manage groups
-   Add group members by email
-   Add, edit, and delete expenses
-   Automatic balance calculation
-   Responsive mobile-friendly UI
-   Protected frontend pages
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

### Deployment

-   Render

---

## Project Structure

```txt
client/
  css/
  js/
  pages/

server/
  config/
  controllers/
  middleware/
  routes/
```

---

## Installation

### Clone the repository

```
git clone <your-github-repo-url>
cd expense-sharing-app
```

### Install dependencies

```
npm install
```

### Create Environment Variables

Create a `.env` file in the project root:

```
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

### Run the project

```
npm run dev
```

Server runs on

```
http://localhost:5000
```
