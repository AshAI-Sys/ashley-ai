import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../button";
import { Input } from "../input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";
import { AshleyAlert } from "../manufacturing/ashley-alert";
import {
  Loader2,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
} from "lucide-react";
import { cn } from "../../lib/utils";

const clientFormSchema = z.object({
  name: z.string().min(2, "Company/Client name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  businessType: z.enum(["RETAILER", "BRAND", "DISTRIBUTOR", "INDIVIDUAL"], {
    required_error: "Please select a business type",
  }),
  address: z.object({
    street: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    province: z.string().min(2, "Province is required"),
    postalCode: z.string().min(4, "Postal code is required"),
    country: z.string().default("Philippines"),
  }),
  paymentTerms: z
    .number()
    .min(0)
    .max(90, "Payment terms must be between 0-90 days"),
  creditLimit: z.number().min(0, "Credit limit must be positive"),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

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

const businessTypeLabels = {
  RETAILER: "Retail Store",
  BRAND: "Fashion Brand",
  DISTRIBUTOR: "Distributor/Wholesaler",
  INDIVIDUAL: "Individual Client",
};

const philippineProvinces = [
  "Metro Manila",
  "Cebu",
  "Davao",
  "Iloilo",
  "Pampanga",
  "Bulacan",
  "Cavite",
  "Laguna",
  "Bataan",
  "Rizal",
  "Quezon",
  "Pangasinan",
  "Nueva Ecija",
  "Tarlac",
  "Batangas",
  "Zambales",
  "Albay",
  "Camarines Sur",
  "Sorsogon",
  "Masbate",
];

export const ClientForm = React.forwardRef<HTMLFormElement, ClientFormProps>(
  (
    {
      initialData,
      onSubmit,
      onCancel,
      isLoading = false,
      ashleyAnalysis,
      className,
    },
    ref
  ) => {
    const form = useForm<ClientFormData>({
      resolver: zodResolver(clientFormSchema),
      defaultValues: {
        name: "",
        email: "",
        phone: "",
        contactPerson: "",
        businessType: "RETAILER",
        address: {
          street: "",
          city: "",
          province: "Metro Manila",
          postalCode: "",
          country: "Philippines",
        },
        paymentTerms: 30,
        creditLimit: 0,
        taxId: "",
        notes: "",
        ...initialData,
      },
    });

    const handleSubmit = async (data: ClientFormData) => {
      try {
        await onSubmit(data);
      } catch (error) {
        console.error("Client form submission error:", error);
      }
    };

    return (
      <div className={cn("space-y-6", className)}>
        {ashleyAnalysis && (
          <AshleyAlert
            risk={ashleyAnalysis.risk}
            issues={ashleyAnalysis.issues}
            recommendations={ashleyAnalysis.recommendations}
            confidence={ashleyAnalysis.confidence}
          />
        )}

        <Form {...form}>
          <form
            ref={ref}
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter the client's basic company and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company/Client Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ABC Fashion Corp" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(businessTypeLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Contact Person *
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Juan Dela Cruz" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TIN/Business Registration</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="000-000-000-000" />
                        </FormControl>
                        <FormDescription>
                          Tax Identification Number or Business Registration
                          Number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="contact@company.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number *
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+63 912 345 6789" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
                <CardDescription>
                  Complete address details for shipping and billing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="123 Main Street, Barangay San Jose"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Municipality *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Quezon City" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Province *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {philippineProvinces.map(province => (
                              <SelectItem key={province} value={province}>
                                {province}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Financial Terms
                </CardTitle>
                <CardDescription>
                  Payment terms and credit arrangements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Terms (Days)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            max="90"
                            onChange={e =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Number of days client has to pay invoices (0-90 days)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Limit (PHP)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            placeholder="0"
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum outstanding amount allowed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Any special requirements, preferences, or important information about this client..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update Client" : "Create Client"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }
);

ClientForm.displayName = "ClientForm";
