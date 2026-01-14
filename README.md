# C-Order - Procurement Management System

A full-stack procurement and task management application designed to streamline purchasing operations, supplier management, and order tracking for organizations.

## 🎯 Overview

C-Order is a comprehensive procurement management platform that enables teams to efficiently manage purchasing tasks, track orders, collaborate with suppliers, and maintain full visibility over the procurement lifecycle. The application features a modern, responsive interface with real-time updates, role-based access control, and integrated document editing capabilities.

## 🚀 Technologies Used

### Frontend
- **React 18** - Modern UI library for building responsive interfaces
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **TanStack Query (React Query)** - Server state management and caching
- **TanStack Table** - Advanced data table functionality
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **TipTap** - Rich text editor
- **React Hook Form + Zod** - Form handling and validation
- **i18next** - Internationalization
- **React Big Calendar** - Calendar view for tasks
- **dnd-kit** - Drag-and-drop functionality
- **Lucide React** - Icon library

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe server-side development
- **Prisma ORM** - Next-generation database toolkit
- **PostgreSQL** - Robust relational database
- **Passport.js** - Authentication middleware
- **JWT** - Secure token-based authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email functionality

### Infrastructure & DevOps
- **Docker & Docker Compose** - Containerization and orchestration
- **pnpm** - Fast, disk-efficient package manager
- **OnlyOffice Document Server** - Online document editing (DOCX, XLSX, PPTX, PDF)
- **Monorepo structure** - Organized workspace with multiple apps

## ✨ Key Features

### Task & Order Management
- **Multiple Views**: List, Kanban board, calendar, and timeline views
- **Task Organization**: Priority levels, status tracking, due dates, and custom fields
- **Rich Task Details**: Comprehensive information including amounts, currencies, order numbers, and delivery dates
- **Comments & Collaboration**: Real-time commenting and task assignments
- **File Attachments**: Upload and manage documents related to tasks

### Supplier Management
- **Supplier Database**: Maintain detailed supplier information including contact details and tax IDs
- **Supplier Association**: Link suppliers to specific tasks and orders
- **Supplier History**: Track all orders and interactions with each supplier

### Document Management
- **OnlyOffice Integration**: Edit office documents directly in the browser
- **Secure Document Editing**: JWT-authenticated document server
- **Multiple Formats**: Support for DOCX, XLSX, PPTX, and PDF files

### User Management & Security
- **Role-Based Access Control**: Admin, Buyer, and Viewer roles
- **Secure Authentication**: JWT-based session management
- **Audit Logging**: Track user actions and changes
- **Email Notifications**: Automated email updates for task changes

### Analytics & Reporting
- **Dashboard**: Overview of key metrics and recent activities
- **Custom Analytics**: Track procurement performance and trends

## 🏗️ Architecture

The application follows a modern **microservices-inspired monorepo** architecture:

```
C-Order/
├── apps/
│   ├── api/          # NestJS backend API
│   │   ├── src/      # Application source code
│   │   ├── prisma/   # Database schema and migrations
│   │   └── Dockerfile
│   └── web/          # React frontend
│       ├── src/      # Application source code
│       └── Dockerfile
├── docker-compose.yml # Service orchestration
└── package.json      # Workspace configuration
```

### Data Flow
1. **Frontend** (React/Vite) → User interactions
2. **API Gateway** (NestJS) → Business logic and authentication
3. **Database** (PostgreSQL + Prisma) → Data persistence
4. **Document Server** (OnlyOffice) → Document editing

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- pnpm 9.0.0+
- Docker & Docker Compose

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/IonutGhe2001/C-Order.git
cd C-Order
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Start infrastructure services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- OnlyOffice Document Server (port 8082)

4. **Configure environment variables**

Create `.env` files in `apps/api/` and `apps/web/` based on the environment requirements.

API environment variables:
```env
DATABASE_URL="postgresql://postgres:your-secure-password@localhost:5432/task"
JWT_SECRET="your-jwt-secret-key"
DS_JWT_SECRET="your-onlyoffice-jwt-secret"
DS_PUBLIC_URL="http://localhost:8082"
API_PUBLIC_URL="http://localhost:3001"
```

5. **Run database migrations**
```bash
cd apps/api
pnpm prisma migrate dev
pnpm prisma generate
```

6. **Start development servers**
```bash
# From root directory
pnpm dev
```

This starts both the API server and the web application concurrently.

### Access the Application
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001
- **OnlyOffice**: http://localhost:8082

## 🎯 Use Cases

- **Procurement Teams**: Manage purchasing requests, orders, and supplier relationships
- **Buyers**: Track order status, delivery dates, and payment information
- **Finance Departments**: Monitor spending, budgets, and invoice processing
- **Management**: Gain visibility into procurement operations and performance

## 📈 Future Enhancements

- Mobile application
- Advanced reporting and analytics
- Integration with ERP systems
- Multi-language support expansion
- Automated workflow triggers

## 📝 OnlyOffice Integration Details

Online editing for DOCX, XLSX, PPTX and PDF files is powered by OnlyOffice Document Server. The server runs with JWT enabled for security.

**Configuration:**
```yaml
onlyoffice:
  image: onlyoffice/documentserver:latest
  environment:
    - JWT_ENABLED=true
    - JWT_SECRET=secret
```

The API signs the editor config and saves changes through the OnlyOffice callback, updating the original file in `uploads/`.

## 👤 Author

**Ionut Gheorghe**
- GitHub: [@IonutGhe2001](https://github.com/IonutGhe2001)