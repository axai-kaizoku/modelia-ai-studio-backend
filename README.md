# Modelia AI Studio Backend

A robust Node.js/Express backend API for AI image generation with authentication, user management, and PostgreSQL database.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access control
- 🎨 **Image Generation API** - AI image generation with prompt and style support
- 📦 **PostgreSQL Database** - Drizzle ORM for type-safe database operations
- ✅ **Input Validation** - Zod schemas for request validation
- 🧪 **Comprehensive Tests** - Jest integration tests for all endpoints
- 🔒 **Security** - Helmet, CORS, rate limiting, and input sanitization
- 📝 **TypeScript** - Full type safety across the codebase

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston + Morgan

## Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- pnpm (recommended) or npm

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd modelia-ai-studio-backend
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/modelia_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRATION_DAYS=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10

# Email (optional - for password reset/verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@modelia.com
```

### 4. Database Setup

Start PostgreSQL (if using Docker):

```bash
npm run docker:db
```

Or ensure your PostgreSQL server is running locally.

Generate and run migrations:

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema to database
npm run db:push

# Or run both at once
npm run db:sync
```

### 5. Run the Application

**Development mode** (with hot reload):

```bash
npm run dev
```

**Production mode**:

```bash
# Build the application
npm run build

# Start with PM2
npm start
```

The server will start at `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/auth/register` | Register new user | No |
| POST | `/v1/auth/login` | Login user | No |
| POST | `/v1/auth/logout` | Logout user | No |

### Generations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/generate` | Create image generation | Yes |
| GET | `/v1/generate?limit=5` | Get user's generations | Yes |

### Example Requests

**Register:**
```bash
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "role": "user"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

**Create Generation:**
```bash
curl -X POST http://localhost:3000/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "style": "realistic",
    "imageUpload": "data:image/png;base64,iVBORw0KG..."
  }'
```

**Get Generations:**
```bash
curl -X GET "http://localhost:3000/v1/generate?limit=5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## Database Management

```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly to database
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio

# Reset database (caution: deletes all data)
npm run db:reset

# Seed database with sample data
npm run db:seed
```

## Docker Deployment

Start the entire stack with Docker:

```bash
# Start database only
npm run docker:db

# Start full application (database + API)
npm run docker:start
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server with PM2 |
| `npm test` | Run test suite |
| `npm run lint` | Check code with Biome |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Biome |
| `npm run db:generate` | Generate database migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio |

## Project Structure

```
modelia-ai-studio-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── db/             # Database schema and migrations
│   ├── middlewares/    # Express middlewares
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── validations/    # Zod validation schemas
│   ├── app.ts          # Express app setup
│   └── index.ts        # Entry point
├── tests/              # Test files
├── drizzle/            # Database migrations
├── .env                # Environment variables
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript config
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production/test) | development |
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_ACCESS_EXPIRATION_MINUTES` | Access token expiration | 30 |
| `JWT_REFRESH_EXPIRATION_DAYS` | Refresh token expiration | 30 |

## Security Features

- **Helmet**: Sets security HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents brute force attacks on auth endpoints
- **Input Sanitization**: Prevents NoSQL injection
- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Stateless authentication
- **Request Size Limit**: 10MB limit for image uploads

## Error Handling

All errors follow a consistent structure:

```json
{
  "code": 400,
  "message": "Error description"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (model overload)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue on the repository.

---

**Status**: 

- [x] Authentication & Authorization
- [x] User Management
- [x] Image Generation API
- [x] Database Integration
- [x] Input Validation
- [x] Comprehensive Tests
- [x] Documentation
