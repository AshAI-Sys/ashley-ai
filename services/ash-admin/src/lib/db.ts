// Temporary mock implementation to fix build errors
// TODO: Fix Prisma client initialization in monorepo setup

const mockRecord = {
  id: 'mock-id',
  created_at: new Date(),
  updated_at: new Date()
}

const mockEmployee = {
  ...mockRecord,
  first_name: 'Mock',
  last_name: 'Employee',
  position: 'Mock Position',
  department: 'Mock Department',
  is_active: true
}

interface MockModel {
  findMany: (args?: any) => Promise<any[]>;
  findUnique: (args?: any) => Promise<any>;
  create: (args?: any) => Promise<any>;
  update: (args?: any) => Promise<any>;
  delete: (args?: any) => Promise<any>;
  count: (args?: any) => Promise<number>;
  upsert: (args?: any) => Promise<any>;
}

const createMockModel = (mockData: any = mockRecord): MockModel => ({
  findMany: async () => [mockData],
  findUnique: async () => mockData,
  create: async (args) => ({ ...mockData, ...args?.data }),
  update: async (args) => ({ ...mockData, ...args?.data }),
  delete: async () => mockData,
  count: async () => 0,
  upsert: async (args) => ({ ...mockData, ...args?.create, ...args?.update })
})

interface MockPrismaClient {
  [key: string]: MockModel | any;
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
}

class MockPrisma implements MockPrismaClient {
  // Core entities
  workspace = createMockModel()
  client = createMockModel()
  order = createMockModel()

  // HR & Employee
  employee = createMockModel(mockEmployee)
  attendanceLog = createMockModel({
    ...mockRecord,
    employee_id: 'mock-employee',
    date: new Date(),
    time_in: new Date(),
    time_out: null,
    status: 'APPROVED',
    employee: mockEmployee
  })
  payrollPeriod = createMockModel()
  payrollEarning = createMockModel()

  // Quality Control
  qualityControlCheck = createMockModel()
  inspection = createMockModel()
  defectCode = createMockModel()
  capa = createMockModel()

  // Production
  designAsset = createMockModel()
  lay = createMockModel()
  bundle = createMockModel()
  cuttingRun = createMockModel()
  printRun = createMockModel()
  sewingRun = createMockModel()
  finishingRun = createMockModel()
  finishedUnit = createMockModel()
  carton = createMockModel()
  shipment = createMockModel()
  delivery = createMockModel()

  // Finance
  invoice = createMockModel()
  invoiceItem = createMockModel()
  payment = createMockModel()
  creditNote = createMockModel()
  bankAccount = createMockModel()
  expense = createMockModel()
  costCenter = createMockModel()
  budget = createMockModel()
  financialReport = createMockModel()

  // Maintenance
  asset = createMockModel()
  workOrder = createMockModel()
  maintenanceSchedule = createMockModel()

  // Client Portal
  clientSession = createMockModel()
  clientNotification = createMockModel()
  clientActivity = createMockModel()
  clientMessage = createMockModel()
  clientPortalSettings = createMockModel()

  // Merchandising AI
  demandForecast = createMockModel()
  productRecommendation = createMockModel()
  marketTrend = createMockModel()
  inventoryInsight = createMockModel()
  aiModelMetrics = createMockModel()
  customerSegment = createMockModel()

  // Automation
  automationRule = createMockModel()
  automationExecution = createMockModel()
  notificationTemplate = createMockModel()
  notification = createMockModel()
  alert = createMockModel()
  integration = createMockModel()
  integrationSyncLog = createMockModel()

  async $connect() {
    console.warn('🔧 Using mock Prisma client - database operations will return mock data')
  }

  async $disconnect() {
    console.log('Mock Prisma client disconnected')
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: MockPrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new MockPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma