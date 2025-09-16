import * as React from "react";
import { z } from "zod";
declare const clientFormSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    contactPerson: z.ZodString;
    businessType: z.ZodEnum<["RETAILER", "BRAND", "DISTRIBUTOR", "INDIVIDUAL"]>;
    address: z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        province: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        street?: string;
        city?: string;
        province?: string;
        postalCode?: string;
        country?: string;
    }, {
        street?: string;
        city?: string;
        province?: string;
        postalCode?: string;
        country?: string;
    }>;
    paymentTerms: z.ZodNumber;
    creditLimit: z.ZodNumber;
    taxId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
        street?: string;
        city?: string;
        province?: string;
        postalCode?: string;
        country?: string;
    };
    businessType?: "RETAILER" | "BRAND" | "DISTRIBUTOR" | "INDIVIDUAL";
    paymentTerms?: number;
    creditLimit?: number;
    notes?: string;
    contactPerson?: string;
    taxId?: string;
}, {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
        street?: string;
        city?: string;
        province?: string;
        postalCode?: string;
        country?: string;
    };
    businessType?: "RETAILER" | "BRAND" | "DISTRIBUTOR" | "INDIVIDUAL";
    paymentTerms?: number;
    creditLimit?: number;
    notes?: string;
    contactPerson?: string;
    taxId?: string;
}>;
export type ClientFormData = z.infer<typeof clientFormSchema>;
export interface ClientFormProps {
    initialData?: Partial<ClientFormData>;
    onSubmit: (data: ClientFormData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    ashleyAnalysis?: {
        risk: "GREEN" | "AMBER" | "RED";
        issues?: Array<{
            type: string;
            message: string;
            details?: Record<string, unknown>;
        }>;
        recommendations?: string[];
        confidence?: number;
    };
    className?: string;
}
export declare const ClientForm: React.ForwardRefExoticComponent<ClientFormProps & React.RefAttributes<HTMLFormElement>>;
export {};
