"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
// Unused import removed: Slider
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Minus,
  Palette,
  Tag,
  Package,
  Calculator,
  Settings,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { formatDate as formatDateUtil } from "@/lib/utils/date";

interface ColorVariant {
  id: string;
  name: string;
  hexCode: string;
  percentage: number;
  quantity: number;
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  type: "print" | "garment" | "packaging" | "other";
  priceType: "fixed" | "percentage" | "per_piece";
  price: number;
  selected: boolean;
  applicableToAll?: boolean;
}

interface AddOnCustomization {
  addOnId: string;
  specifications: string;
  notes: string;
  customQuantity?: number;
  customPrice?: number;
}

interface VariantsAddonsSectionProps {
  totalQuantity: number;
  colorVariants: ColorVariant[];
  selectedAddOns: string[];
  onColorVariantsChange: (variants: ColorVariant[]) => void;
  onAddOnsChange: (addOnIds: string[]) => void;
  onPricingUpdate: (addOnsCost: number, colorVariantsCost: number) => void;
}

const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy Blue", hex: "#001F3F" },
  { name: "Royal Blue", hex: "#0074D9" },
  { name: "Red", hex: "#FF4136" },
  { name: "Maroon", hex: "#85144B" },
  { name: "Green", hex: "#2ECC40" },
  { name: "Forest Green", hex: "#3D9970" },
  { name: "Yellow", hex: "#FFDC00" },
  { name: "Orange", hex: "#FF851B" },
  { name: "Gray", hex: "#AAAAAA" },
  { name: "Purple", hex: "#B10DC9" },
];

const AVAILABLE_ADDONS: AddOn[] = [
  {
    id: "puff-print",
    name: "Puff Print",
    description: "Raised 3D print effect",
    type: "print",
    priceType: "per_piece",
    price: 15,
    selected: false,
  },
  {
    id: "anti-migration",
    name: "Anti-Migration Base",
    description: "Prevents ink bleeding on polyester",
    type: "print",
    priceType: "per_piece",
    price: 8,
    selected: false,
  },
  {
    id: "premium-thread",
    name: "Premium Embroidery Thread",
    description: "High-quality polyester thread",
    type: "print",
    priceType: "percentage",
    price: 20,
    selected: false,
  },
  {
    id: "custom-tags",
    name: "Custom Neck Tags",
    description: "Branded neck tags",
    type: "garment",
    priceType: "per_piece",
    price: 12,
    selected: false,
  },
  {
    id: "size-labels",
    name: "Custom Size Labels",
    description: "Branded size labels",
    type: "garment",
    priceType: "per_piece",
    price: 8,
    selected: false,
  },
  {
    id: "care-labels",
    name: "Custom Care Labels",
    description: "Branded care instruction labels",
    type: "garment",
    priceType: "per_piece",
    price: 6,
    selected: false,
  },
  {
    id: "poly-bags",
    name: "Individual Poly Bags",
    description: "Each piece in poly bag",
    type: "packaging",
    priceType: "per_piece",
    price: 3,
    selected: false,
  },
  {
    id: "custom-boxes",
    name: "Custom Packaging Boxes",
    description: "Branded packaging boxes",
    type: "packaging",
    priceType: "fixed",
    price: 500,
    selected: false,
  },
  {
    id: "hang-tags",
    name: "Custom Hang Tags",
    description: "Branded hang tags with string",
    type: "packaging",
    priceType: "per_piece",
    price: 5,
    selected: false,
  },
];

export function VariantsAddonsSection({
  totalQuantity,
  colorVariants,
  selectedAddOns,
  onColorVariantsChange,
  onAddOnsChange,
  onPricingUpdate,
}: VariantsAddonsSectionProps) {
  const [addOns, _setAddOns] = useState<AddOn[]>(AVAILABLE_ADDONS);
  const [addOnCustomizations, setAddOnCustomizations] = useState<
    AddOnCustomization[]
  >([]);
  const [expandedAddOn, setExpandedAddOn] = useState<string | null>(null);
  const [customAddOns, setCustomAddOns] = useState<AddOn[]>([]);

  useEffect(() => {
    calculatePricing();
  }, [colorVariants, selectedAddOns, totalQuantity]);

  const calculatePricing = () => {
    // Calculate color variants cost
    const colorVariantsCost =
      colorVariants.length > 1 ? colorVariants.length * 25 : 0;

    // Calculate add-ons cost
    const addOnsCost = selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find(a => a.id === addOnId);
      if (!addOn) return total;

      switch (addOn.priceType) {
        case "fixed":
          return total + addOn.price;
        case "per_piece":
          return total + addOn.price * totalQuantity;
        case "percentage":
          // Base on a standard unit price of â‚±200 for percentage calculations
          return total + (200 * totalQuantity * addOn.price) / 100;
        default:
          return total;
      }
    }, 0);

    onPricingUpdate(addOnsCost, colorVariantsCost);
  };

  const addColorVariant = () => {
    const newVariant: ColorVariant = {
      id: Math.random().toString(36).substring(7),
      name: "",
      hexCode: "#000000",
      percentage: 0,
      quantity: 0,
    };
    onColorVariantsChange([...colorVariants, newVariant]);
  };

  const removeColorVariant = (id: string) => {
    if (colorVariants.length > 1) {
      onColorVariantsChange(colorVariants.filter(v => v.id !== id));
    }
  };

  const updateColorVariant = (
    id: string,
    field: keyof ColorVariant,
    value: any
  ) => {
    const updatedVariants = colorVariants.map(variant => {
      if (variant.id === id) {
        const updated = { ...variant, [field]: value };

        // Auto-calculate quantity when percentage changes
        if (field === "percentage" && totalQuantity > 0) {
          updated.quantity = Math.round((totalQuantity * value) / 100);
        }

        // Auto-calculate percentage when quantity changes
        if (field === "quantity" && totalQuantity > 0) {
          updated.percentage = Math.round((value / totalQuantity) * 100);
        }

        return updated;
      }
      return variant;
    });
    onColorVariantsChange(updatedVariants);
  };

  const distributeEquallyAcrossColors = () => {
    if (colorVariants.length === 0 || totalQuantity === 0) return;

    const basePercentage = Math.floor(100 / colorVariants.length);
    const remainder = 100 % colorVariants.length;

    const updatedVariants = colorVariants.map((variant, index) => {
      const percentage = basePercentage + (index < remainder ? 1 : 0);
      const quantity = Math.round((totalQuantity * percentage) / 100);

      return {
        ...variant,
        percentage,
        quantity,
      };
    });

    onColorVariantsChange(updatedVariants);
    toast.success("Quantities distributed equally across colors");
  };

  const selectPresetColor = (
    variantId: string,
    color: { name: string; hex: string }
  ) => {
    updateColorVariant(variantId, "name", color.name);
    updateColorVariant(variantId, "hexCode", color.hex);
  };

  const toggleAddOn = (addOnId: string) => {
    const currentSelected = selectedAddOns.includes(addOnId);
    if (currentSelected) {
      onAddOnsChange(selectedAddOns.filter(id => id !== addOnId));
    } else {
      onAddOnsChange([...selectedAddOns, addOnId]);
    }
  };

  const toggleCustomization = (addOnId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    if (expandedAddOn === addOnId) {
      setExpandedAddOn(null);
    } else {
      setExpandedAddOn(addOnId);

      // Initialize customization if it doesn't exist
      const existingCustomization = addOnCustomizations.find(
        c => c.addOnId === addOnId
      );
      if (!existingCustomization) {
        setAddOnCustomizations([
          ...addOnCustomizations,
          {
            addOnId,
            specifications: "",
            notes: "",
            customQuantity: undefined,
            customPrice: undefined,
          },
        ]);
      }
    }
  };

  const updateCustomization = (
    addOnId: string,
    field: keyof AddOnCustomization,
    value: any
  ) => {
    setAddOnCustomizations(prev => {
      const existing = prev.find(c => c.addOnId === addOnId);
      if (existing) {
        return prev.map(c =>
          c.addOnId === addOnId ? { ...c, [field]: value } : c
        );
      } else {
        return [
          ...prev,
          {
            addOnId,
            specifications: "",
            notes: "",
            customQuantity: undefined,
            customPrice: undefined,
            [field]: value,
          },
        ];
      }
    });
  };

  const getCustomization = (addOnId: string) => {
    return addOnCustomizations.find(c => c.addOnId === addOnId);
  };

  const addCustomAddOn = () => {
    const newAddOn: AddOn = {
      id: `custom_addon_${Date.now()}`,
      name: "New Custom Add-on",
      description: "Custom add-on description",
      type: "other",
      priceType: "per_piece",
      price: 0,
      selected: false,
    };
    setCustomAddOns([...customAddOns, newAddOn]);
    toast.success("Custom add-on created");
  };

  const removeCustomAddOn = (addOnId: string) => {
    setCustomAddOns(customAddOns.filter(a => a.id !== addOnId));
    // Also remove from selected if it was selected
    onAddOnsChange(selectedAddOns.filter(id => id !== addOnId));
    toast.success("Custom add-on removed");
  };

  const updateCustomAddOn = (
    addOnId: string,
    field: keyof AddOn,
    value: any
  ) => {
    setCustomAddOns(prev =>
      prev.map(addon =>
        addon.id === addOnId ? { ...addon, [field]: value } : addon
      )
    );
  };

  const getAddOnGroupedByType = () => {
    const grouped: { [key: string]: AddOn[] } = {};
    addOns.forEach(addOn => {
      if (!grouped[addOn.type]) {
        grouped[addOn.type] = [];
      }
      grouped[addOn.type]!.push(addOn);
    });
    return grouped;
  };

  const formatPrice = (addOn: AddOn) => {
    switch (addOn.priceType) {
      case "fixed":
        return `â‚±${addOn.price.toLocaleString()}`;
      case "per_piece":
        return `â‚±${addOn.price}/pc`;
      case "percentage":
        return `+${addOn.price}%`;
      default:
        return "";
    }
  };

  const getTotalColorQuantity = () => {
    return colorVariants.reduce((sum, variant) => sum + variant.quantity, 0);
  };

  const getTotalColorPercentage = () => {
    return colorVariants.reduce((sum, variant) => sum + variant.percentage, 0);
  };

  const groupedAddOns = getAddOnGroupedByType();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          D. Variants & Add-ons
          <Badge variant="outline">Optional</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Variants */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Color Variants</Label>
              <p className="text-sm text-muted-foreground">
                Specify different colors and their quantities
              </p>
            </div>
            <div className="flex gap-2">
              {colorVariants.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={distributeEquallyAcrossColors}
                  disabled={totalQuantity === 0}
                >
                  <Calculator className="mr-1 h-4 w-4" />
                  Distribute Equally
                </Button>
              )}
              <Button onClick={addColorVariant} size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add Color
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {colorVariants.map((variant, index) => (
              <div key={variant.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Color {index + 1}</h4>
                  {colorVariants.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeColorVariant(variant.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <Label>Color Name</Label>
                    <Input
                      value={variant.name}
                      onChange={e =>
                        updateColorVariant(variant.id, "name", e.target.value)
                      }
                      placeholder="e.g., Black, Navy Blue"
                    />
                  </div>

                  <div>
                    <Label>Color Code</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={variant.hexCode}
                        onChange={e =>
                          updateColorVariant(
                            variant.id,
                            "hexCode",
                            e.target.value
                          )
                        }
                        className="h-10 w-16 rounded border p-1"
                      />
                      <Input
                        value={variant.hexCode}
                        onChange={e =>
                          updateColorVariant(
                            variant.id,
                            "hexCode",
                            e.target.value
                          )
                        }
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Percentage (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={variant.percentage || ""}
                      onChange={e =>
                        updateColorVariant(
                          variant.id,
                          "percentage",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>

                {/* Preset Colors */}
                <div>
                  <Label className="text-sm">Quick Select Colors</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color.hex}
                        onClick={() => selectPresetColor(variant.id, color)}
                        className="flex items-center gap-2 rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                        title={color.name}
                      >
                        <div
                          className="h-4 w-4 rounded border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Color Summary */}
          {colorVariants.length > 0 && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">Color Distribution Summary</span>
                <div className="text-sm text-muted-foreground">
                  {getTotalColorQuantity()}/{totalQuantity} pieces (
                  {getTotalColorPercentage()}%)
                </div>
              </div>

              <div className="space-y-2">
                {colorVariants
                  .filter(v => v.quantity > 0)
                  .map(variant => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded border"
                          style={{ backgroundColor: variant.hexCode }}
                        />
                        <span>{variant.name || "Unnamed Color"}</span>
                      </div>
                      <span>
                        {variant.quantity} pcs ({variant.percentage}%)
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Add-ons */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                Add-ons & Enhancements
              </Label>
              <p className="text-sm text-muted-foreground">
                Select additional services and enhancements
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={addCustomAddOn}>
              <Plus className="mr-1 h-4 w-4" />
              Add Custom Add-on
            </Button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedAddOns).map(([type, typeAddOns]) => (
              <div key={type}>
                <h4 className="mb-3 flex items-center gap-2 font-medium capitalize">
                  {type === "print" && <Palette className="h-4 w-4" />}
                  {type === "garment" && <Tag className="h-4 w-4" />}
                  {type === "packaging" && <Package className="h-4 w-4" />}
                  {type.replace("_", " ")} Options
                </h4>

                <div className="grid gap-3 md:grid-cols-2">
                  {typeAddOns.map(addOn => {
                    const customization = getCustomization(addOn.id);
                    const isExpanded = expandedAddOn === addOn.id;

                    return (
                      <div key={addOn.id} className="space-y-2">
                        <div
                          className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                            selectedAddOns.includes(addOn.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => toggleAddOn(addOn.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedAddOns.includes(addOn.id)}
                              onChange={() => toggleAddOn(addOn.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h5 className="font-medium">{addOn.name}</h5>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {formatPrice(addOn)}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-6 w-6 p-0 ${isExpanded ? "bg-blue-100" : ""}`}
                                    onClick={e =>
                                      toggleCustomization(addOn.id, e)
                                    }
                                    title="Customize"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {addOn.description}
                              </p>

                              {selectedAddOns.includes(addOn.id) &&
                                addOn.priceType !== "percentage" && (
                                  <div className="mt-2 text-xs text-blue-600">
                                    Total: â‚±
                                    {(addOn.priceType === "fixed"
                                      ? addOn.price
                                      : addOn.price * totalQuantity
                                    ).toLocaleString()}
                                  </div>
                                )}

                              {customization &&
                                (customization.specifications ||
                                  customization.notes) && (
                                  <div className="mt-2 border-t border-gray-200 pt-2">
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                      <Settings className="h-3 w-3" />
                                      <span>Customized</span>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Customization Panel */}
                        {isExpanded && (
                          <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <h6 className="flex items-center gap-2 text-sm font-medium">
                                <Settings className="h-4 w-4" />
                                Customize {addOn.name}
                              </h6>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={e => toggleCustomization(addOn.id, e)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div>
                              <Label className="text-xs">Specifications</Label>
                              <Input
                                placeholder="e.g., Size: 5cm x 5cm, Material: Woven"
                                value={customization?.specifications || ""}
                                onChange={e =>
                                  updateCustomization(
                                    addOn.id,
                                    "specifications",
                                    e.target.value
                                  )
                                }
                                onClick={e => e.stopPropagation()}
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label className="text-xs">
                                Notes / Instructions
                              </Label>
                              <Input
                                placeholder="Special instructions or requirements"
                                value={customization?.notes || ""}
                                onChange={e =>
                                  updateCustomization(
                                    addOn.id,
                                    "notes",
                                    e.target.value
                                  )
                                }
                                onClick={e => e.stopPropagation()}
                                className="mt-1"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">
                                  Custom Quantity (Optional)
                                </Label>
                                <Input
                                  type="number"
                                  placeholder="Default: order qty"
                                  value={customization?.customQuantity || ""}
                                  onChange={e =>
                                    updateCustomization(
                                      addOn.id,
                                      "customQuantity",
                                      parseInt(e.target.value) || undefined
                                    )
                                  }
                                  onClick={e => e.stopPropagation()}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label className="text-xs">
                                  Custom Price (Optional)
                                </Label>
                                <Input
                                  type="number"
                                  placeholder={`Default: â‚±${addOn.price}`}
                                  value={customization?.customPrice || ""}
                                  onChange={e =>
                                    updateCustomization(
                                      addOn.id,
                                      "customPrice",
                                      parseFloat(e.target.value) || undefined
                                    )
                                  }
                                  onClick={e => e.stopPropagation()}
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div className="rounded bg-white/50 p-2 text-xs text-muted-foreground">
                              ðŸ’¡ Tip: Leave quantity/price blank to use default
                              values
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Custom Add-ons Section */}
            {customAddOns.length > 0 && (
              <div>
                <h4 className="mb-3 flex items-center gap-2 font-medium capitalize">
                  <Settings className="h-4 w-4" />
                  Custom Add-ons
                </h4>

                <div className="grid gap-3 md:grid-cols-2">
                  {customAddOns.map(addOn => {
                    const customization = getCustomization(addOn.id);
                    const isExpanded = expandedAddOn === addOn.id;

                    return (
                      <div key={addOn.id} className="space-y-2">
                        <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedAddOns.includes(addOn.id)}
                              onChange={() => toggleAddOn(addOn.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 space-y-2">
                              {/* Editable Name */}
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="default"
                                  className="bg-purple-600 text-xs"
                                >
                                  Custom
                                </Badge>
                                <Input
                                  value={addOn.name}
                                  onChange={e =>
                                    updateCustomAddOn(
                                      addOn.id,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  className="h-8 flex-1 font-medium"
                                  placeholder="Add-on name"
                                  onClick={e => e.stopPropagation()}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-600"
                                  onClick={() => removeCustomAddOn(addOn.id)}
                                  title="Remove custom add-on"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Editable Description */}
                              <Input
                                value={addOn.description}
                                onChange={e =>
                                  updateCustomAddOn(
                                    addOn.id,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className="h-8 text-sm"
                                placeholder="Description"
                                onClick={e => e.stopPropagation()}
                              />

                              {/* Price Type and Price */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Price Type</Label>
                                  <Select
                                    value={addOn.priceType}
                                    onValueChange={value =>
                                      updateCustomAddOn(
                                        addOn.id,
                                        "priceType",
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="per_piece">
                                        Per Piece
                                      </SelectItem>
                                      <SelectItem value="fixed">
                                        Fixed
                                      </SelectItem>
                                      <SelectItem value="percentage">
                                        Percentage
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label className="text-xs">
                                    Price{" "}
                                    {addOn.priceType === "percentage"
                                      ? "(%)"
                                      : "(â‚±)"}
                                  </Label>
                                  <Input
                                    type="number"
                                    value={addOn.price}
                                    onChange={e =>
                                      updateCustomAddOn(
                                        addOn.id,
                                        "price",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="h-8"
                                    placeholder="0"
                                    onClick={e => e.stopPropagation()}
                                  />
                                </div>
                              </div>

                              {/* Type Selection */}
                              <div>
                                <Label className="text-xs">Category</Label>
                                <Select
                                  value={addOn.type}
                                  onValueChange={value =>
                                    updateCustomAddOn(addOn.id, "type", value)
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="print">Print</SelectItem>
                                    <SelectItem value="garment">
                                      Garment
                                    </SelectItem>
                                    <SelectItem value="packaging">
                                      Packaging
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Show price preview */}
                              {selectedAddOns.includes(addOn.id) &&
                                addOn.priceType !== "percentage" && (
                                  <div className="rounded bg-purple-100 p-2 text-xs text-purple-600">
                                    Total: â‚±
                                    {(addOn.priceType === "fixed"
                                      ? addOn.price
                                      : addOn.price * totalQuantity
                                    ).toLocaleString()}
                                  </div>
                                )}

                              {/* Expand for more details */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs"
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleCustomization(addOn.id, e);
                                }}
                              >
                                {isExpanded ? (
                                  <Minus className="mr-1 h-3 w-3" />
                                ) : (
                                  <Plus className="mr-1 h-3 w-3" />
                                )}
                                {isExpanded ? "Less" : "More"} Details
                              </Button>
                            </div>
                          </div>

                          {/* Customization Panel */}
                          {isExpanded && (
                            <div className="mt-3 space-y-2 border-t border-purple-200 pt-3">
                              <div>
                                <Label className="text-xs">
                                  Specifications
                                </Label>
                                <Input
                                  placeholder="e.g., Size, Material, etc."
                                  value={customization?.specifications || ""}
                                  onChange={e =>
                                    updateCustomization(
                                      addOn.id,
                                      "specifications",
                                      e.target.value
                                    )
                                  }
                                  onClick={e => e.stopPropagation()}
                                  className="mt-1 h-8"
                                />
                              </div>

                              <div>
                                <Label className="text-xs">
                                  Notes / Instructions
                                </Label>
                                <Input
                                  placeholder="Special instructions"
                                  value={customization?.notes || ""}
                                  onChange={e =>
                                    updateCustomization(
                                      addOn.id,
                                      "notes",
                                      e.target.value
                                    )
                                  }
                                  onClick={e => e.stopPropagation()}
                                  className="mt-1 h-8"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add-ons Summary */}
        {selectedAddOns.length > 0 && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h4 className="mb-3 font-medium text-green-900">
              Selected Add-ons Summary
            </h4>
            <div className="space-y-2">
              {selectedAddOns.map(addOnId => {
                const addOn =
                  addOns.find(a => a.id === addOnId) ||
                  customAddOns.find(a => a.id === addOnId);
                if (!addOn) return null;

                let cost = 0;
                switch (addOn.priceType) {
                  case "fixed":
                    cost = addOn.price;
                    break;
                  case "per_piece":
                    cost = addOn.price * totalQuantity;
                    break;
                  case "percentage":
                    cost = (200 * totalQuantity * addOn.price) / 100;
                    break;
                }

                return (
                  <div
                    key={addOnId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{addOn.name}</span>
                    <span className="font-medium text-green-700">
                      â‚±{cost.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
