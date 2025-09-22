import * as React from "react";
import { z } from "zod";
declare const orderIntakeFormSchema: z.ZodObject<{
    clientId: z.ZodString;
    orderNumber: z.ZodOptional<z.ZodString>;
    garmentType: z.ZodEnum<["T_SHIRT", "POLO_SHIRT", "DRESS_SHIRT", "BLOUSE", "DRESS", "PANTS", "SHORTS", "SKIRT", "JACKET", "HOODIE", "UNIFORM", "OTHER"]>;
    customGarmentType: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    quantity: z.ZodNumber;
    sizeCurve: z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodNumber>, Record<string, number>, Record<string, number>>;
    targetPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    deadline: z.ZodDate;
    priority: z.ZodEnum<["LOW", "NORMAL", "HIGH", "URGENT"]>;
    materials: z.ZodArray<z.ZodObject<{
        type: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        unit: z.ZodEnum<["YARDS", "METERS", "PIECES", "KG", "GRAMS"]>;
        color: z.ZodOptional<z.ZodString>;
        supplier: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type?: string;
        quantity?: number;
        unit?: "KG" | "YARDS" | "METERS" | "PIECES" | "GRAMS";
        supplier?: string;
        description?: string;
        color?: string;
    }, {
        type?: string;
        quantity?: number;
        unit?: "KG" | "YARDS" | "METERS" | "PIECES" | "GRAMS";
        supplier?: string;
        description?: string;
        color?: string;
    }>, "many">;
    colorways: z.ZodArray<z.ZodString, "many">;
    specifications: z.ZodOptional<z.ZodObject<{
        printingMethod: z.ZodOptional<z.ZodEnum<["SCREEN", "DIGITAL", "HEAT_TRANSFER", "EMBROIDERY", "NONE"]>>;
        fabricWeight: z.ZodOptional<z.ZodString>;
        fitType: z.ZodOptional<z.ZodEnum<["SLIM", "REGULAR", "LOOSE", "OVERSIZED"]>>;
        neckType: z.ZodOptional<z.ZodString>;
        sleeveLength: z.ZodOptional<z.ZodString>;
        hemType: z.ZodOptional<z.ZodString>;
        pocketType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        printingMethod?: "EMBROIDERY" | "HEAT_TRANSFER" | "SCREEN" | "DIGITAL" | "NONE";
        fabricWeight?: string;
        fitType?: "OVERSIZED" | "SLIM" | "REGULAR" | "LOOSE";
        neckType?: string;
        sleeveLength?: string;
        hemType?: string;
        pocketType?: string;
    }, {
        printingMethod?: "EMBROIDERY" | "HEAT_TRANSFER" | "SCREEN" | "DIGITAL" | "NONE";
        fabricWeight?: string;
        fitType?: "OVERSIZED" | "SLIM" | "REGULAR" | "LOOSE";
        neckType?: string;
        sleeveLength?: string;
        hemType?: string;
        pocketType?: string;
    }>>;
    designFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    referenceImages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    specialRequirements: z.ZodOptional<z.ZodString>;
    packagingRequirements: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    clientId?: string;
    garmentType?: "T_SHIRT" | "POLO_SHIRT" | "DRESS_SHIRT" | "BLOUSE" | "DRESS" | "PANTS" | "SHORTS" | "SKIRT" | "JACKET" | "HOODIE" | "UNIFORM" | "OTHER";
    quantity?: number;
    targetPrice?: number;
    deadline?: Date;
    specifications?: {
        printingMethod?: "EMBROIDERY" | "HEAT_TRANSFER" | "SCREEN" | "DIGITAL" | "NONE";
        fabricWeight?: string;
        fitType?: "OVERSIZED" | "SLIM" | "REGULAR" | "LOOSE";
        neckType?: string;
        sleeveLength?: string;
        hemType?: string;
        pocketType?: string;
    };
    materials?: {
        type?: string;
        quantity?: number;
        unit?: "KG" | "YARDS" | "METERS" | "PIECES" | "GRAMS";
        supplier?: string;
        description?: string;
        color?: string;
    }[];
    sizeCurve?: Record<string, number>;
    priority?: "LOW" | "HIGH" | "URGENT" | "NORMAL";
    description?: string;
    orderNumber?: string;
    customGarmentType?: string;
    maxPrice?: number;
    colorways?: string[];
    designFiles?: string[];
    referenceImages?: string[];
    specialRequirements?: string;
    packagingRequirements?: string;
}, {
    clientId?: string;
    garmentType?: "T_SHIRT" | "POLO_SHIRT" | "DRESS_SHIRT" | "BLOUSE" | "DRESS" | "PANTS" | "SHORTS" | "SKIRT" | "JACKET" | "HOODIE" | "UNIFORM" | "OTHER";
    quantity?: number;
    targetPrice?: number;
    deadline?: Date;
    specifications?: {
        printingMethod?: "EMBROIDERY" | "HEAT_TRANSFER" | "SCREEN" | "DIGITAL" | "NONE";
        fabricWeight?: string;
        fitType?: "OVERSIZED" | "SLIM" | "REGULAR" | "LOOSE";
        neckType?: string;
        sleeveLength?: string;
        hemType?: string;
        pocketType?: string;
    };
    materials?: {
        type?: string;
        quantity?: number;
        unit?: "KG" | "YARDS" | "METERS" | "PIECES" | "GRAMS";
        supplier?: string;
        description?: string;
        color?: string;
    }[];
    sizeCurve?: Record<string, number>;
    priority?: "LOW" | "HIGH" | "URGENT" | "NORMAL";
    description?: string;
    orderNumber?: string;
    customGarmentType?: string;
    maxPrice?: number;
    colorways?: string[];
    designFiles?: string[];
    referenceImages?: string[];
    specialRequirements?: string;
    packagingRequirements?: string;
}>;
export type OrderIntakeFormData = z.infer<typeof orderIntakeFormSchema>;
export interface OrderIntakeFormProps {
    initialData?: Partial<OrderIntakeFormData>;
    clients: Array<{
        id: string;
        name: string;
        businessType: string;
    }>;
    onSubmit: (data: OrderIntakeFormData) => Promise<void>;
    onCancel?: () => void;
    onValidate?: (data: Partial<OrderIntakeFormData>) => Promise<unknown>;
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
export declare const OrderIntakeForm: React.ForwardRefExoticComponent<OrderIntakeFormProps & React.RefAttributes<HTMLFormElement>>;
export {};
