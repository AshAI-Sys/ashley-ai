import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "../button";
import { Input } from "../input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { SizeCurveInput } from "../manufacturing/size-curve-input";
import { AshleyAlert } from "../manufacturing/ashley-alert";
import { Badge } from "../badge";
import { Calendar } from "../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import {
  Loader2, Package, Calendar as CalendarIcon,
  Palette, Ruler
} from "lucide-react";
import { cn } from "../../lib/utils";

const materialSchema = z.object({
  type: z.string().min(1, "Material type is required"),
  description: z.string().optional(),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.enum(["YARDS", "METERS", "PIECES", "KG", "GRAMS"], {
    required_error: "Please select a unit",
  }),
  color: z.string().optional(),
  supplier: z.string().optional(),
});

const orderIntakeFormSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  orderNumber: z.string().optional(),
  garmentType: z.enum([
    "T_SHIRT", "POLO_SHIRT", "DRESS_SHIRT", "BLOUSE", "DRESS", 
    "PANTS", "SHORTS", "SKIRT", "JACKET", "HOODIE", "UNIFORM", "OTHER"
  ], {
    required_error: "Please select a garment type",
  }),
  customGarmentType: z.string().optional(),
  description: z.string().min(5, "Please provide a detailed description"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  sizeCurve: z.record(z.number().nonnegative()).refine(
    (curve) => Object.values(curve).reduce((sum, qty) => sum + qty, 0) > 0,
    "Size curve must have at least one size with quantity > 0"
  ),
  targetPrice: z.number().positive("Target price must be positive").optional(),
  maxPrice: z.number().positive("Maximum price must be positive").optional(),
  deadline: z.date({
    required_error: "Please select a deadline",
  }),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"], {
    required_error: "Please select priority level",
  }),
  materials: z.array(materialSchema).min(1, "At least one material is required"),
  colorways: z.array(z.string()).min(1, "At least one colorway is required"),
  specifications: z.object({
    printingMethod: z.enum(["SCREEN", "DIGITAL", "HEAT_TRANSFER", "EMBROIDERY", "NONE"]).optional(),
    fabricWeight: z.string().optional(),
    fitType: z.enum(["SLIM", "REGULAR", "LOOSE", "OVERSIZED"]).optional(),
    neckType: z.string().optional(),
    sleeveLength: z.string().optional(),
    hemType: z.string().optional(),
    pocketType: z.string().optional(),
  }).optional(),
  designFiles: z.array(z.string()).optional(),
  referenceImages: z.array(z.string()).optional(),
  specialRequirements: z.string().optional(),
  packagingRequirements: z.string().optional(),
});

export type OrderIntakeFormData = z.infer<typeof orderIntakeFormSchema>;

export interface OrderIntakeFormProps {
  initialData?: Partial<OrderIntakeFormData>;
  clients: Array<{ id: string; name: string; businessType: string }>;
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

const garmentTypeLabels = {
  T_SHIRT: "T-Shirt",
  POLO_SHIRT: "Polo Shirt",
  DRESS_SHIRT: "Dress Shirt",
  BLOUSE: "Blouse",
  DRESS: "Dress",
  PANTS: "Pants/Trousers",
  SHORTS: "Shorts",
  SKIRT: "Skirt",
  JACKET: "Jacket",
  HOODIE: "Hoodie/Sweatshirt",
  UNIFORM: "Uniform",
  OTHER: "Other (Custom)",
};


const printingMethods = {
  SCREEN: "Screen Printing",
  DIGITAL: "Digital Printing",
  HEAT_TRANSFER: "Heat Transfer",
  EMBROIDERY: "Embroidery",
  NONE: "No Printing",
};

const fitTypes = {
  SLIM: "Slim Fit",
  REGULAR: "Regular Fit",
  LOOSE: "Loose Fit",
  OVERSIZED: "Oversized",
};

export const OrderIntakeForm = React.forwardRef<HTMLFormElement, OrderIntakeFormProps>(
  ({ 
    initialData, 
    clients,
    onSubmit, 
    onCancel,
    onValidate,
    isLoading = false, 
    ashleyAnalysis, 
    className 
  }, ref) => {
    const [isValidating, setIsValidating] = React.useState(false);

    const form = useForm<OrderIntakeFormData>({
      resolver: zodResolver(orderIntakeFormSchema),
      defaultValues: {
        clientId: "",
        garmentType: "T_SHIRT",
        description: "",
        quantity: 100,
        sizeCurve: { M: 40, L: 35, XL: 25 },
        priority: "NORMAL",
        materials: [
          {
            type: "Cotton Fabric",
            quantity: 50,
            unit: "YARDS",
            color: "",
            supplier: "",
          },
        ],
        colorways: ["White"],
        specifications: {
          fitType: "REGULAR",
          printingMethod: "SCREEN",
        },
        ...initialData,
      },
    });

    // Material and colorway management - arrays handled in form defaults

    const watchedGarmentType = form.watch("garmentType");
    const watchedQuantity = form.watch("quantity");
    const watchedSizeCurve = form.watch("sizeCurve");

    // Auto-validate total quantity matches size curve
    React.useEffect(() => {
      const sizeCurveTotal = Object.values(watchedSizeCurve || {}).reduce((sum, qty) => sum + qty, 0);
      if (sizeCurveTotal > 0 && sizeCurveTotal !== watchedQuantity) {
        form.setValue("quantity", sizeCurveTotal);
      }
    }, [watchedSizeCurve, form]);

    const handleValidate = async () => {
      if (!onValidate) return;
      
      setIsValidating(true);
      try {
        const currentData = form.getValues();
        await onValidate(currentData);
      } catch (error) {
        console.error("Validation error:", error);
      } finally {
        setIsValidating(false);
      }
    };

    const handleSubmit = async (data: OrderIntakeFormData) => {
      try {
        await onSubmit(data);
      } catch (error) {
        console.error("Order form submission error:", error);
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
          <form ref={ref} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Basic Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
                <CardDescription>
                  Basic information about the production order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{client.name}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {client.businessType}
                                  </Badge>
                                </div>
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
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority Level *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">
                              <span className="text-green-600">Low Priority</span>
                            </SelectItem>
                            <SelectItem value="NORMAL">Normal Priority</SelectItem>
                            <SelectItem value="HIGH">
                              <span className="text-orange-600">High Priority</span>
                            </SelectItem>
                            <SelectItem value="URGENT">
                              <span className="text-red-600">Urgent</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Description *</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Detailed description of the garment requirements..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Deadline *
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date: Date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleValidate}
                      disabled={isValidating}
                      className="flex-1"
                    >
                      {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Validate with Ashley AI
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Garment Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Garment Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="garmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Garment Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(garmentTypeLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedGarmentType === "OTHER" && (
                    <FormField
                      control={form.control}
                      name="customGarmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Garment Type *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Specify garment type" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="specifications.fitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fit Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(fitTypes).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
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
                    name="specifications.printingMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Printing Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(printingMethods).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
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
                    name="specifications.fabricWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fabric Weight</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 180gsm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quantity & Sizing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Quantity & Size Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Total quantity will be calculated from size distribution
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {Object.values(watchedSizeCurve || {}).reduce((sum, qty) => sum + qty, 0)} pieces
                  </Badge>
                </div>

                <FormField
                  control={form.control}
                  name="sizeCurve"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size Distribution *</FormLabel>
                      <FormControl>
                        <SizeCurveInput
                          value={field.value}
                          onChange={field.onChange}
                          totalQuantity={watchedQuantity}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Order
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }
);

OrderIntakeForm.displayName = "OrderIntakeForm";