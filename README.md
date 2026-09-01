# AI Culture Hub - Learning Management System

A comprehensive learning management system (LMS) built with Angular 17 and ASP.NET Core 8.0, featuring role-based access control, gamification, article management, course enrollment, quizzes, and achievements.

## Current Version

**v1.0.0** - Initial Release

## Technology Stack

### Frontend
- **Framework:** Angular 17 (Standalone Components)
- **UI Library:** Bootstrap 5 with RTL support
- **State Management:** RxJS
- **HTTP Client:** Angular HttpClient
- **Routing:** Angular Router with Guards

### Backend
- **Framework:** ASP.NET Core 8.0
- **ORM:** Entity Framework Core
- **Authentication:** JWT Bearer Tokens
- **Database:** SQL Server

### Database
- **Engine:** Microsoft SQL Server
- **Migrations:** Entity Framework Core Migrations
- **Seed Data:** Pre-configured roles, permissions, departments, positions

## Features

### User Management
- User registration and authentication
- Role-based access control (RBAC)
- Department and position management
- User profile management
- Active/Inactive user status

### Roles & Permissions
- 5 default roles: Administrator, ContentManager, Editor, Instructor, Employee
- 51 permissions across 12 modules
- Page-based permission assignment
- Dynamic navigation based on user permissions

### Content Management
- Article creation and management with categories
- Course management with lessons
- Quizzes with questions and answers
- Challenges and gamification
- Announcements system

### Gamification
- Points system
- User levels and progression
- Badges and achievements
- Learning streak tracking
- Leaderboard

## Project Structure

```
Ai Site/
├── Backend/
│   ├── API/                    # ASP.NET Core Web API
│   │   ├── Controllers/         # API Controllers
│   │   ├── Attributes/         # Custom Attributes (RequirePermission)
│   │   └── Program.cs          # Application Entry Point
│   ├── Application/
│   │   ├── DTOs/               # Data Transfer Objects
│   │   └── Interfaces/         # Service Interfaces
│   ├── Domain/
│   │   └── Entities/           # Domain Entities
│   └── Infrastructure/
│       ├── Data/               # DbContext & Configurations
│       └── Services/           # Service Implementations
├── Frontend/
│   └── AngularApp/
│       └── src/
│           └── app/
│               ├── core/       # Core services, guards, interceptors
│               ├── features/   # Feature modules
│               └── shared/     # Shared components
├── Database/
│   ├── Migrations/             # EF Core Migrations
│   ├── Scripts/                # SQL Scripts
│   └── SeedData/              # Database Seed Data
└── Documentation/              # Project Documentation
```

## Installation

### Prerequisites

- .NET 8.0 SDK
- Node.js 18+ and npm
- SQL Server (LocalDB or full instance)
- Git

### Database Setup

1. Create a SQL Server database named `AICultureHub`

2. The application uses Entity Framework Core migrations. On first run, the database schema and seed data will be created automatically.

3. Alternatively, run the SQL script manually:
```bash
sqlcmd -S localhost -d AICultureHub -i Database/Scripts/01_CreateSchema.sql
```

### Backend Setup

1. Navigate to the Backend directory:
```bash
cd Backend/API
```

2. Update the connection string in `appsettings.json` if needed:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=AICultureHub;..."
}
```

3. Run the backend:
```bash
dotnet run --urls "http://localhost:5060"
```

The backend will:
- Create database schema via EF Core migrations
- Seed default roles, permissions, departments, and positions
- Start listening on http://localhost:5060

### Frontend Setup

1. Navigate to the Frontend directory:
```bash
cd Frontend/AngularApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will start on http://localhost:4200

### Default Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | Admin123! | Administrator |

## Configuration

### Environment Variables

You can override configuration using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_CONNECTION_STRING` | SQL Server connection string | localhost |
| `JWT_SECRET` | JWT signing key | (built-in default) |
| `JWT_ISSUER` | JWT issuer name | AICultureHub |
| `JWT_EXPIRY_MINUTES` | Token expiry in minutes | 1440 |

### JWT Settings

The JWT secret should be changed in production. Use a strong, random string of at least 32 characters.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Users (Admin)
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Deactivate user

### Roles
- `GET /api/roles` - List roles
- `POST /api/roles` - Create role
- `PUT /api/roles/{id}` - Update role (including permissions)
- `DELETE /api/roles/{id}` - Delete role
- `GET /api/roles/permissions/grouped` - Get permissions by module
- `POST /api/roles/assign` - Assign role to user

### Articles
- `GET /api/articles` - List articles
- `POST /api/articles` - Create article (requires Articles.Create permission)
- `PUT /api/articles/{id}` - Update article (requires Articles.Edit permission)
- `DELETE /api/articles/{id}` - Delete article (requires Articles.Delete permission)

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course (requires Courses.Create permission)
- `PUT /api/courses/{id}` - Update course (requires Courses.Edit permission)
- `DELETE /api/courses/{id}` - Delete course (requires Courses.Delete permission)

## Default Roles & Permissions

### Administrator
Full system access with all permissions enabled.

### ContentManager
Manages articles, courses, categories, and announcements.

### Editor
Edits articles and content entries.

### Instructor
Manages courses and quizzes.

### Employee
Basic access to learning content (read-only by default).

### Permission Modules
- Dashboard
- Users
- Roles
- Articles
- Categories
- Courses
- Quizzes
- Challenges
- Announcements
- Reports
- Settings
- Glossary

## Git Workflow

### Branches
- `main` - Production-ready code
- `develop` - Development integration (if used)

### Versioning
This project uses Semantic Versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New backward-compatible features
- **PATCH**: Bug fixes

### Tags
```bash
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

## Building for Production

### Frontend
```bash
cd Frontend/AngularApp
npm install
ng build --configuration production
```

Output will be in `dist/angular-app/`

### Backend
```bash
cd Backend/API
dotnet publish -c Release -o ./publish
```

## Troubleshooting

### Database Connection Issues
- Ensure SQL Server is running
- Verify connection string
- Check firewall settings

### Angular Build Issues
```bash
cd Frontend/AngularApp
rm -rf node_modules
npm install
```

### Backend Build Issues
```bash
cd Backend
dotnet clean
dotnet restore
dotnet build
```

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is prohibited.

## Author

AI Culture Hub Development Team

## Changelog

### v1.0.0 (Initial Release)
- User authentication and authorization
- Role-based access control (RBAC) with 51 permissions
- Article management system
- Course and lesson management
- Quiz system with questions and answers
- Gamification (points, levels, badges, leaderboard)
- User profile management
- Department and position management
- Announcement system
- Responsive RTL UI with Bootstrap 5
