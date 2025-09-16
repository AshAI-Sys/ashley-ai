# ASH AI Development Guide

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ with npm
- **PostgreSQL** 14+ 
- **Redis** 6+ (for caching and sessions)
- **Git** for version control

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd ash-ai
   npm install
   ```

2. **Database Setup**
   ```bash
   # Create databases
   createdb ash_ai_dev
   createdb ash_ai_test
   
   # Copy environment file
   cp .env.example .env
   # Edit .env with your database URLs and API keys
   ```

3. **Run Migrations**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture Overview

### Service Communication
- **Event Bus**: Services communicate via events (`ash.*` prefix)
- **API Gateway**: `ash-api` serves as BFF (Backend for Frontend)
- **Database**: Shared PostgreSQL with tenant isolation
- **Cache**: Redis for session management and caching

### Service Responsibilities

| Service | Port | Responsibility |
|---------|------|----------------|
| ash-api | 3000 | API Gateway, BFF |
| ash-admin | 3001 | Admin Interface |
| ash-staff | 3002 | Staff PWA |
| ash-portal | 3003 | Client Portal |
| ash-core | - | Business Logic (Internal) |
| ash-ai | - | AI Service (Internal) |

## 📦 Package Management

### Workspace Structure
```bash
# Install package for specific service
npm install express --workspace=services/ash-api

# Install shared dependency for all workspaces
npm install typescript --workspaces

# Run script in specific workspace
npm run dev --workspace=services/ash-admin
```

### Shared Packages
- **@ash/shared**: Common utilities, constants, helpers
- **@ash/types**: TypeScript type definitions
- **@ash/ui**: React components, styling
- **@ash/database**: Prisma schema, migrations
- **@ash/events**: Event definitions, pub/sub

## 🗄️ Database Development

### Schema Management
```bash
# Generate migration after schema changes
npm run db:generate

# Run migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset

# Seed test data
npm run db:seed
```

### Multi-tenancy
- All tables include `workspace_id` for tenant isolation
- Row-level security (RLS) enforced at database level
- Use `getWorkspaceId()` helper in all queries

### Naming Conventions
- Tables: `snake_case` (e.g., `order_line_items`)
- Columns: `snake_case` (e.g., `created_at`)
- Indexes: `idx_table_column` (e.g., `idx_orders_workspace_id`)
- Foreign keys: `fk_table_column` (e.g., `fk_orders_client_id`)

## 🔐 Authentication & Authorization

### RBAC Implementation
```typescript
// Role hierarchy
type Role = 'Admin' | 'Manager' | 'CSR' | 'Worker' | 'Client'

// Permission check
if (!hasPermission(user, 'orders:create')) {
  throw new UnauthorizedError()
}
```

### 2FA Requirements
- **Admin**: Mandatory 2FA
- **Manager**: Mandatory 2FA  
- **CSR**: Optional 2FA
- **Worker/Client**: Not required

## 📡 Event-Driven Architecture

### Event Naming
```typescript
// Format: ash.{service}.{entity}.{action}
'ash.core.order.created'
'ash.ai.prediction.generated'  
'ash.portal.payment.completed'
```

### Event Publishing
```typescript
import { eventBus } from '@ash/events'

await eventBus.publish('ash.core.order.created', {
  orderId,
  workspaceId,
  clientId,
  amount,
  timestamp: new Date()
})
```

### Event Handling
```typescript
import { eventBus } from '@ash/events'

eventBus.subscribe('ash.core.order.created', async (event) => {
  // Update inventory
  // Trigger Ashley AI analysis
  // Send notifications
})
```

## 🤖 Ashley AI Development

### AI Service Architecture
```typescript
interface AshleyAnalysis {
  type: 'capacity' | 'quality' | 'route' | 'stock' | 'fatigue'
  confidence: number
  recommendations: Recommendation[]
  alerts: Alert[]
}
```

### Integration Points
- **Order Validation**: Check capacity vs deadline
- **Route Planning**: Validate production routing
- **Quality Prediction**: Analyze historical patterns
- **Stock Management**: Predict material needs
- **Performance Monitoring**: Track worker fatigue

## 📱 Frontend Development

### Tech Stack
- **React 18** with TypeScript
- **Next.js 13** with App Router
- **Tailwind CSS** for styling
- **Shadcn/ui** for components
- **React Query** for data fetching

### PWA (Staff App)
- **Offline-first** architecture
- **Background sync** with conflict resolution
- **QR code scanning** for bundle tracking
- **Push notifications** for tasks

### Client Portal
- **Magic link** authentication
- **Real-time updates** via WebSocket
- **Mobile-responsive** design
- **Multi-language** support

## 🧪 Testing Strategy

### Test Types
- **Unit Tests**: Jest for business logic
- **Integration Tests**: Supertest for APIs
- **E2E Tests**: Playwright for user flows
- **Load Tests**: Artillery for performance

### Test Commands
```bash
# Run all tests
npm test

# Run tests for specific service
npm test --workspace=services/ash-core

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Environments
- **Development**: Local development
- **Staging**: Production-like testing
- **Production**: Live system

### Docker Setup
```bash
# Build all services
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec ash-core npm run db:migrate
```

### Environment Variables
- Use `.env.example` as template
- Never commit actual `.env` files
- Use secrets management in production

## 📊 Monitoring & Logging

### Structured Logging
```typescript
import { logger } from '@ash/shared/logger'

logger.info('Order created', {
  orderId,
  workspaceId,
  amount,
  stage: 'intake'
})
```

### Metrics Collection
- **Business Metrics**: Order volume, cycle times
- **Technical Metrics**: Response times, error rates
- **AI Metrics**: Prediction accuracy, recommendation adoption

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
1. **Lint & Test**: Run on all PRs
2. **Build**: Create Docker images
3. **Deploy Staging**: Auto-deploy on merge to main
4. **Deploy Production**: Manual approval required

### Quality Gates
- All tests must pass
- Code coverage > 80%
- No security vulnerabilities
- Performance benchmarks met

## 📚 Code Standards

### TypeScript
- Strict mode enabled
- No `any` types allowed
- Prefer interfaces over types
- Use branded types for IDs

### API Design
- RESTful endpoints
- Consistent error responses
- Pagination for list endpoints
- Idempotency keys for mutations

### Database
- All mutations logged to `audit_logs`
- Use transactions for multi-table operations
- Soft deletes for important records
- Indexes on all foreign keys

## 🐛 Debugging

### Common Issues
1. **Database Connection**: Check `ASH_DB_URL` format
2. **Missing Migrations**: Run `npm run db:migrate`
3. **Event Bus**: Verify Redis connection
4. **Authentication**: Check JWT secret and expiry

### Debug Tools
- **Database**: Use Prisma Studio for data inspection
- **API**: Postman collection for endpoint testing
- **Events**: Redis CLI for message debugging
- **Logs**: Structured JSON logs for analysis

---

## 📞 Support

For development questions:
1. Check this documentation
2. Search existing GitHub issues
3. Ask in team Slack channel
4. Create GitHub issue with reproduction steps