# 🧱 Project Management Tool – Built with T3 Stack

This is a **Trello-style Kanban project management** tool built using the powerful **T3 Stack**, featuring real-time task management, user-specific project access, and role-based permissions.

---

## 🧠 About the Project

### 🌟 Key Features

- **Email/Password Authentication** via NextAuth.js
- **Protected Dashboard** showing:
  - Projects created by the user
  - Projects where the user is a participant
- **Create and Manage Projects** with auto-generated Kanban boards
- **Swimlanes**: `To Do`, `In Progress`, `Done`
- **Create Tasks**:
  - Only project creators can create tasks
  - Tasks can be dragged to update status
  - Descriptions are editable via a save button
  - Assignees can be changed with a dropdown
  - Only project creators or task assignees can edit
  - Creator cannot be changed once assigned

---

## 🔐 Authentication

- Uses **NextAuth.js** for secure session handling
- **Email + Password login**
- All pages and API routes are protected – no unauthenticated access

---

## ⚙️ Setup Instructions

###

1️⃣ Clone the Repository

git clone https://github.com/your-username/your-repo.git
cd your-repo

2️⃣ Install Dependencies

npm install

# or

yarn install

3️⃣ Configure Environment Variables
Create a .env file in the root using this template:

✅ .env.example
env
Copy
Edit

# Next Auth

AUTH_SECRET="your_generated_auth_secret"
AUTH_URL="http://localhost:3000"

# Optional - Discord OAuth Provider (Not used)

AUTH_DISCORD_ID="dummy"
AUTH_DISCORD_SECRET="dummy"

# PostgreSQL via Supabase (Connection pooling)

DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/postgres?pgbouncer=true"

# Direct connection for migrations

DIRECT_URL="postgresql://<user>:<password>@<host>:<port>/postgres"

Generate an auth secret using:

npx auth secret

5️⃣ Run the Application
bash
Copy
Edit
npm run dev

# or

yarn dev
