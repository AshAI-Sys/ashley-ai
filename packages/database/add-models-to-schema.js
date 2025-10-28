const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const newModels = `
model Supplier {
  id                String          @id @default(cuid())
  workspace_id      String
  supplier_code     String
  name              String
  contact_person    String?
  email             String?
  phone             String?
  address           String?
  city              String?
  country           String?         @default("Philippines")
  payment_terms     String?
  currency          String          @default("PHP")
  tax_id            String?
  rating            Float?
  is_active         Boolean         @default(true)
  notes             String?
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  workspace         Workspace       @relation("WorkspaceSuppliers", fields: [workspace_id], references: [id])
  purchase_orders   PurchaseOrder[]

  @@unique([workspace_id, supplier_code])
  @@index([workspace_id])
  @@index([workspace_id, is_active])
  @@index([supplier_code])
  @@map("suppliers")
}

model PurchaseOrder {
  id                  String              @id @default(cuid())
  workspace_id        String
  po_number           String
  supplier_id         String
  order_date          DateTime            @default(now())
  expected_delivery   DateTime?
  actual_delivery     DateTime?
  status              String              @default("DRAFT")
  subtotal            Float               @default(0)
  tax_amount          Float               @default(0)
  shipping_cost       Float               @default(0)
  total_amount        Float               @default(0)
  currency            String              @default("PHP")
  payment_terms       String?
  payment_status      String              @default("UNPAID")
  notes               String?
  approved_by         String?
  approved_at         DateTime?
  created_by          String
  created_at          DateTime            @default(now())
  updated_at          DateTime            @updatedAt
  workspace           Workspace           @relation("WorkspacePurchaseOrders", fields: [workspace_id], references: [id])
  supplier            Supplier            @relation(fields: [supplier_id], references: [id])
  created_by_user     User                @relation("PurchaseOrderCreatedBy", fields: [created_by], references: [id])
  approved_by_user    User?               @relation("PurchaseOrderApprovedBy", fields: [approved_by], references: [id])
  items               PurchaseOrderItem[]

  @@unique([workspace_id, po_number])
  @@index([workspace_id])
  @@index([workspace_id, status])
  @@index([workspace_id, supplier_id])
  @@index([status])
  @@index([order_date])
  @@map("purchase_orders")
}

model PurchaseOrderItem {
  id                  String        @id @default(cuid())
  purchase_order_id   String
  material_name       String
  material_type       String
  description         String?
  quantity            Float
  unit                String
  unit_price          Float
  tax_rate            Float         @default(0)
  discount_percent    Float         @default(0)
  total_price         Float
  received_quantity   Float         @default(0)
  created_at          DateTime      @default(now())
  updated_at          DateTime      @updatedAt
  purchase_order      PurchaseOrder @relation(fields: [purchase_order_id], references: [id], onDelete: Cascade)

  @@index([purchase_order_id])
  @@map("purchase_order_items")
}

model AutoReorderSetting {
  id                    String   @id @default(cuid())
  workspace_id          String
  material_inventory_id String   @unique
  enabled               Boolean  @default(true)
  reorder_point         Float
  reorder_quantity      Float
  preferred_supplier_id String?
  lead_time_days        Int?
  safety_stock_days     Int?     @default(7)
  notes                 String?
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt
  workspace             Workspace @relation("WorkspaceAutoReorderSettings", fields: [workspace_id], references: [id])

  @@index([workspace_id])
  @@index([workspace_id, enabled])
  @@map("auto_reorder_settings")
}
`;

// Find the MaterialTransaction model end
const insertAfter = '@@map("material_transactions")\n}';
const insertIndex = schema.indexOf(insertAfter);

if (insertIndex === -1) {
  console.error('Could not find insertion point');
  process.exit(1);
}

// Insert after MaterialTransaction
const insertPosition = insertIndex + insertAfter.length;
schema = schema.slice(0, insertPosition) + '\n' + newModels + '\n' + schema.slice(insertPosition);

// Also need to add relations to Workspace model
// Find Workspace model and add the new relations
const workspaceModelRegex = /model Workspace \{[\s\S]*?\n\}/;
const workspaceMatch = schema.match(workspaceModelRegex);

if (workspaceMatch) {
  const workspaceModel = workspaceMatch[0];

  // Add new relations before the closing brace
  const newRelations = `  suppliers                Supplier[]               @relation("WorkspaceSuppliers")
  purchase_orders          PurchaseOrder[]          @relation("WorkspacePurchaseOrders")
  auto_reorder_settings    AutoReorderSetting[]     @relation("WorkspaceAutoReorderSettings")
`;

  const updatedWorkspace = workspaceModel.replace(/(\n)(  @@map\("workspaces"\))/, `${newRelations}$1$2`);
  schema = schema.replace(workspaceModel, updatedWorkspace);
}

// Add relations to User model for PurchaseOrder
const userModelRegex = /model User \{[\s\S]*?\n\}/;
const userMatch = schema.match(userModelRegex);

if (userMatch) {
  const userModel = userMatch[0];
  const newUserRelations = `  purchase_orders_created  PurchaseOrder[]          @relation("PurchaseOrderCreatedBy")
  purchase_orders_approved PurchaseOrder[]          @relation("PurchaseOrderApprovedBy")
`;

  const updatedUser = userModel.replace(/(\n)(  @@unique)/, `${newUserRelations}$1$2`);
  schema = schema.replace(userModel, updatedUser);
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('✅ Successfully added Supplier, PurchaseOrder, and AutoReorderSetting models to schema!');
console.log('📝 Run: cd packages/database && npx prisma format && npx prisma generate');
