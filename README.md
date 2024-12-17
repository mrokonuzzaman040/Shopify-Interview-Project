# **Role Management Admin Panel**

A modern **Role Management Admin Panel** built with **Remix**, **Prisma**, and **PostgreSQL**. This application provides user management features, role creation, and admin tools with clean and interactive UI.

---
<!-- Contact -->
## **Author**

- **Name**: Rokon Uzzaman
- **Role**: Frontend Developer
- **Portfolio**: [https://portfolio-v2-git-main-md-rokon-uzzamans-projects.vercel.app/](https://portfolio-v2-git-main-md-rokon-uzzamans-projects.vercel.app/)
- **GitHub**: [mrokonuzzaman040](https://github.com/mrokonuzzaman040)
- **LinkedIn**: [Rokon Uzzaman](https://www.linkedin.com/in/rokonuzzaman040/)
- **Email**: [mdrokonuzzamanmail@gmail.com](mailto:mdrokonuzzamanmail@gmail.com)
- **Phone**: +880 1610 830286

For any inquiries or support, please reach out to us:

- **Email**: [mdrokonuzzamanmail@gmail.com](mailto:mdrokonuzzamanmail@gmail.com)
- **WhatsApp**: [Whatsapp](https://wa.me/8801610830286?text=Hello%2C%20I%20would%20like%20to%20learn%20more%20about%20your%20services%21)

---

## **Table of Contents**

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Prerequisites](#prerequisites)
4. [Project Setup](#project-setup)
5. [Database Configuration](#database-configuration)
6. [Running the Application](#running-the-application)
7. [Testing Instructions](#testing-instructions)
8. [Folder Structure](#folder-structure)
9. [API Documentation](#api-documentation)

---

## **Features**

- **Role Management**:
  - Add, edit, and delete roles.
  - Inline editing for role names with form validation.
- **User Management**:
  - View, edit, and delete user details.
  - Admin dashboard displaying stats for users and roles.
- **Authentication**:
  - Role-based access control (RBAC).
- **Error Handling**:
  - Display proper success and error messages for all operations.

---

## **Technologies Used**

- **Frontend**: Remix, React
- **Backend**: Remix Server, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **UI Framework**: Tailwind CSS
- **Session Management**: Remix `sessionStorage`
- **Validation**: Custom Regex for form inputs

---

## **Prerequisites**

Ensure you have the following tools installed on your system:

1. **Node.js** (v18+)
2. **PostgreSQL** (v12+)
3. **npm** or **Yarn** (latest version)
4. **Prisma CLI**

---

## **Project Setup**

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/mrokonuzzaman040/Shopify-Interview-Project.git
   cd Shopify-Interview-Project
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:

   - Create a `.env` file in the root directory:
     ```env
     DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/your_database?schema=public"
     SESSION_SECRET="your_random_session_secret"
     NODE_ENV="development"
     ```

     Replace `USERNAME`, `PASSWORD`, and `your_database` with your PostgreSQL credentials.

---

## **Database Configuration**

1. **Initialize Prisma**:
   - Generate the Prisma client:
     ```bash
     npx prisma generate
     ```

2. **Apply Migrations**:
   - Create and apply database migrations:
     ```bash
     npx prisma migrate dev --name init
     ```

3. **Seed the Database** (optional):
   - Populate the database with initial data:
     ```bash
     npx prisma db seed
     ```

---

## **Running the Application**

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```

   The app will be available at **http://localhost:5173**.

2. **Build the Application**:
   ```bash
   npm run build
   ```

3. **Start the Production Server**:
   ```bash
   npm start
   ```

---

## **Testing Instructions**

1. **Setup Jest** for Unit Testing:
   - Install Jest and dependencies:
     ```bash
     npm install --save-dev jest ts-jest @types/jest
     ```

2. **Configure Jest**:
   - Create a `jest.config.js` file:
     ```javascript
     module.exports = {
       preset: "ts-jest",
       testEnvironment: "node",
       moduleNameMapper: {
         "^~/(.*)$": "<rootDir>/app/$1",
       },
     };
     ```

3. **Write Tests**:
   - Place test files in the `/tests` directory and name them with `.test.tsx`.

4. **Run Tests**:
   ```bash
   npm test
   ```

---

## **Folder Structure**

```bash
Shopify-Interview-Project/
├── app
│   ├── components
│   │   ├── ListItem.tsx
│   │   ├── SectionCard.tsx
│   │   └── StatCard.tsx
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   ├── root.tsx
│   ├── routes
│   │   ├── admin.tsx
│   │   ├── api.profile.tsx
│   │   ├── api.register.tsx
│   │   ├── dashboard.tsx
│   │   ├── _index.tsx
│   │   ├── login.tsx
│   │   ├── logout.tsx
│   │   ├── profile.tsx
│   │   ├── register.tsx
│   │   ├── roles._index.tsx
│   │   ├── users.$id.tsx
│   │   └── users._index.tsx
│   ├── session.ts
│   ├── tailwind.css
│   └── utils
│       ├── prisma.server.ts
│       └── roleChecker.ts
├── package.json
├── package-lock.json
├── postcss.config.js
├── prisma
│   ├── migrations
│   │   ├── 20241216154634_add_user_model
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   └── schema.prisma
├── public
│   ├── favicon.ico
│   ├── logo-dark.png
│   └── logo-light.png
├── README.md
├── .env
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## **API Documentation**

### **1. Loader Endpoints**

- **Roles Endpoint**:
  - `GET /role`
  - Response:
    ```json
    {
      "roles": [{ "id": "uuid", "name": "admin" }]
    }
    ```

- **User Details**:
  - `GET /users/:id`
  - Response:
    ```json
    {
      "user": {
        "id": "uuid",
        "username": "JohnDoe",
        "email": "john@example.com",
        "role": "admin"
      }
    }
    ```

### **2. Action Endpoints**

- **Add Role**:
  - `POST /role` with form data:
    ```json
    {
      "action": "add",
      "name": "newrole"
    }
    ```

- **Update Role**:
  - `POST /role` with form data:
    ```json
    {
      "action": "update",
      "id": "uuid",
      "name": "updatedrole"
    }
    ```

- **Delete Role**:
  - `POST /role` with form data:
    ```json
    {
      "action": "delete",
      "id": "uuid"
    }
    ```

---

## **Common Issues**

1. **Database Connection Errors**:
   - Ensure your `.env` file is correctly set up.
   - Verify PostgreSQL is running and accessible.

2. **Session Errors**:
   - Ensure a valid `SESSION_SECRET` is set in the `.env` file.

3. **Validation Errors**:
   - Role names only accept **letters (A-Z, a-z)**. Avoid numbers or special characters.

