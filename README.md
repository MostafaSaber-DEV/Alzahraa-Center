# Sales CRM Interface

A modern, production-ready educational management system built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Student Management**: Track students, groups, and subscriptions with real-time updates
- **Authentication & Security**: Secure auth with Supabase, rate limiting, and CSRF protection
- **Performance Optimized**: Dynamic imports, image optimization, and caching
- **Responsive Design**: Mobile-first with Tailwind CSS and shadcn/ui components
- **Type Safety**: Full TypeScript coverage with strict mode
- **Testing**: Comprehensive unit and E2E tests with 80%+ coverage
- **CI/CD**: Automated testing, linting, and deployment pipeline
- **Developer Experience**: ESLint, Prettier, Husky pre-commit hooks

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) with React 18
- **Language**: TypeScript 5+ (Strict Mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with JWT tokens
- **Testing**: Jest (Unit) + Playwright (E2E)
- **Deployment**: Vercel with Edge Runtime
- **Code Quality**: ESLint + Prettier + Husky

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sales-crm-interface
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

4. **Database Setup**
   Run the SQL scripts in `/scripts` folder in your Supabase SQL editor:
   - `001_create_user_tables.sql`
   - `002_create_rls_policies.sql`
   - `003_create_profile_trigger.sql`

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

### Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run start` - Start production server
- `npm run analyze` - Analyze bundle size with @next/bundle-analyzer

### Code Quality

- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing

- `npm run test` - Run unit tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:coverage` - Generate test coverage report

### Security & Maintenance

- `npm audit` - Check for security vulnerabilities
- `npm run prepare` - Setup Husky pre-commit hooks

## 🏗️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase clients
│   ├── auth.ts           # Auth utilities
│   └── utils.ts          # General utilities
├── scripts/              # Database scripts
├── tests/                # Test files
└── public/               # Static assets
```

## 🔒 Security

- Environment variables are never committed
- API routes are protected with authentication
- RLS policies enforce data isolation
- Input validation with Zod schemas
- Secure webhook signatures

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test -- --coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 🔧 Environment Variables

| Variable                        | Description               | Required |
| ------------------------------- | ------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL      | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key    | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key | Yes      |
| `NEXT_PUBLIC_APP_URL`           | Application URL           | Yes      |
| `WEBHOOK_SECRET`                | Webhook signature secret  | No       |
| `N8N_WEBHOOK_URL`               | n8n webhook URL           | No       |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- Follow TypeScript strict mode
- Use Prettier for formatting
- Write tests for new features
- Follow conventional commits

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@example.com or create an issue in the repository.
