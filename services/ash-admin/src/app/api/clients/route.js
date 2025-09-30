"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
// Temporarily disable database for demo mode
// import { prisma } from '@/lib/db';
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// File-based storage for created clients (persists across hot reloads)
const STORAGE_FILE = path.join(process.cwd(), '.next', 'created-clients.json');
// Helper functions for file-based storage
const loadCreatedClients = () => {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch (error) {
        console.warn('Could not load created clients:', error);
    }
    return [];
};
const saveCreatedClients = (clients) => {
    try {
        // Ensure .next directory exists
        const nextDir = path.dirname(STORAGE_FILE);
        if (!fs.existsSync(nextDir)) {
            fs.mkdirSync(nextDir, { recursive: true });
        }
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(clients, null, 2));
    }
    catch (error) {
        console.warn('Could not save created clients:', error);
    }
};
const CreateClientSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Client name is required'),
    contact_person: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    email: zod_1.z.string().email('Valid email is required'),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.union([zod_1.z.string(), zod_1.z.object({
            street: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            state: zod_1.z.string().optional(),
            postal_code: zod_1.z.string().optional(),
            country: zod_1.z.string().optional(),
        })]).optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    tax_id: zod_1.z.string().optional(),
    payment_terms: zod_1.z.number().optional(),
    credit_limit: zod_1.z.number().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).default('ACTIVE'),
    notes: zod_1.z.string().optional(),
});
const UpdateClientSchema = CreateClientSchema.partial();
async function GET(request) {
    try {
        // Demo data for client list
        const demoClients = [
            {
                id: 'client-1',
                name: 'Manila Shirts Co.',
                company: 'Manila Shirts Corporation',
                email: 'orders@manilashirts.com',
                phone: '+63 917 123 4567',
                status: 'ACTIVE',
                createdAt: new Date('2024-01-15'),
                brands: [
                    { id: 'brand-1', name: 'Manila Classic', code: 'MNLC' },
                    { id: 'brand-2', name: 'Manila Pro', code: 'MNLP' }
                ],
                orders: [
                    { id: 'order-1', status: 'IN_PROGRESS', totalAmount: 45000, createdAt: new Date('2024-03-01') },
                    { id: 'order-2', status: 'COMPLETED', totalAmount: 32000, createdAt: new Date('2024-02-15') }
                ],
                _count: { orders: 12, brands: 2 }
            },
            {
                id: 'client-2',
                name: 'Cebu Sports Apparel',
                company: 'Cebu Sports Inc.',
                email: 'procurement@cebusports.ph',
                phone: '+63 932 987 6543',
                status: 'ACTIVE',
                createdAt: new Date('2024-02-20'),
                brands: [
                    { id: 'brand-3', name: 'Cebu Athletes', code: 'CBAT' }
                ],
                orders: [
                    { id: 'order-3', status: 'PENDING', totalAmount: 28000, createdAt: new Date('2024-03-10') }
                ],
                _count: { orders: 5, brands: 1 }
            },
            {
                id: 'client-3',
                name: 'Davao Uniform Solutions',
                company: 'Davao Uniform Solutions LLC',
                email: 'info@davaouniform.com',
                phone: '+63 912 345 6789',
                status: 'ACTIVE',
                createdAt: new Date('2024-01-30'),
                brands: [
                    { id: 'brand-4', name: 'Davao Corporate', code: 'DVCR' },
                    { id: 'brand-5', name: 'Davao Schools', code: 'DVSC' }
                ],
                orders: [],
                _count: { orders: 8, brands: 2 }
            }
        ];
        // Load created clients from file storage and combine with demo clients
        const createdClients = loadCreatedClients();
        const allClients = [...demoClients, ...createdClients];
        return server_1.NextResponse.json({
            success: true,
            data: {
                clients: allClients,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: allClients.length,
                    pages: 1,
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching clients:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch clients' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const validatedData = CreateClientSchema.parse(body);
        // Create new client with proper formatting to match frontend interface
        const newClient = {
            id: `client-${Date.now()}`,
            name: validatedData.name,
            contact_person: validatedData.contact_person || '',
            email: validatedData.email,
            phone: validatedData.phone || '',
            address: typeof validatedData.address === 'object'
                ? JSON.stringify(validatedData.address)
                : (validatedData.address || ''),
            tax_id: validatedData.tax_id || '',
            payment_terms: validatedData.payment_terms || null,
            credit_limit: validatedData.credit_limit || null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            _count: { orders: 0, brands: 0 }
        };
        // Load existing created clients, add new client, and save back to file
        const createdClients = loadCreatedClients();
        createdClients.push(newClient);
        saveCreatedClients(createdClients);
        return server_1.NextResponse.json({
            success: true,
            data: newClient,
            message: 'Client created successfully'
        }, { status: 201 });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Error creating client:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create client' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: 'Client ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const validatedData = UpdateClientSchema.parse(body);
        // Check if client exists
        const existingClient = await prisma.client.findUnique({
            where: { id }
        });
        if (!existingClient) {
            return server_1.NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
        }
        // Check email uniqueness if email is being updated
        if (validatedData.email && validatedData.email !== existingClient.email) {
            const emailExists = await prisma.client.findFirst({
                where: {
                    email: validatedData.email,
                    id: { not: id }
                }
            });
            if (emailExists) {
                return server_1.NextResponse.json({ success: false, error: 'Client with this email already exists' }, { status: 400 });
            }
        }
        const client = await prisma.client.update({
            where: { id },
            data: validatedData,
            include: {
                brands: true,
                _count: {
                    select: {
                        orders: true,
                        brands: true,
                    }
                }
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: client,
            message: 'Client updated successfully'
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Error updating client:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to update client' }, { status: 500 });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: 'Client ID is required' }, { status: 400 });
        }
        // Check if client exists
        const existingClient = await prisma.client.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        orders: true,
                        brands: true,
                    }
                }
            }
        });
        if (!existingClient) {
            return server_1.NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
        }
        // Check if client has orders or brands (prevent deletion if they do)
        if (existingClient._count.orders > 0) {
            return server_1.NextResponse.json({ success: false, error: 'Cannot delete client with existing orders' }, { status: 400 });
        }
        await prisma.client.delete({
            where: { id }
        });
        return server_1.NextResponse.json({
            success: true,
            message: 'Client deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting client:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to delete client' }, { status: 500 });
    }
}
