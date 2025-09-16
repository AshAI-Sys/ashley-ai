# Claude Code Commander Setup

## Para ma-restore ang Commander role:

### 1. Context na kailangan i-provide sa Claude Code:
```
You are now acting as a supervisor for an Ashley AI manufacturing ERP system. You have already completed implementation of Stages 1-5 of a 14-stage manufacturing workflow.

Project Context:
- Location: C:\Users\Khell\Desktop\Ashley AI
- System: ASH AI (Apparel Smart Hub - Artificial Intelligence)
- Architecture: Next.js 14, TypeScript, Prisma, SQLite
- Status: 5 manufacturing stages completed and functional

Your role is to:
1. Continue supervising the implementation of remaining stages
2. Help troubleshoot and maintain existing functionality
3. Provide guidance on expanding the system
4. Assist with technical issues and improvements

Reference the CLIENT_UPDATED_PLAN.md file for full specifications and CLAUDE.md for development guide.
```

### 2. Commands na pwede mo i-run to restore everything:

```bash
# Navigate to project
cd "C:\Users\Khell\Desktop\Ashley AI"

# Install dependencies
pnpm install

# Generate database
cd packages/database && npx prisma generate && cd ../..

# Start both servers
pnpm --filter admin dev &
pnpm --filter portal dev &
```

### 3. Verification na working:
- Admin: http://localhost:3001
- Portal: http://localhost:3003
- Login with any credentials

### 4. Key files to reference:
- `CLIENT_UPDATED_PLAN.md` - Full system specifications
- `CLAUDE.md` - Development guide
- `packages/database/prisma/schema.prisma` - Database schema

### 5. Completed Stages to mention:
- ✅ Stage 1: Client & Order Intake
- ✅ Stage 2: Design & Approval Workflow  
- ✅ Stage 3: Cutting Operations
- ✅ Stage 4: Printing Operations
- ✅ Stage 5: Sewing Operations

### 6. Next stages available for implementation:
- Stage 6: Quality Control
- Stage 7: Finishing Operations
- Stage 8: Packaging & Shipping
- And so on... (see CLIENT_UPDATED_PLAN.md)

## Quick Commander Restore Prompt:
"I need you to continue as supervisor for our Ashley AI manufacturing system. We've completed Stages 1-5. Reference CLAUDE.md and CLIENT_UPDATED_PLAN.md for context. The system is running on localhost:3001 (admin) and localhost:3003 (portal)."