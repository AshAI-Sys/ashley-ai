import * as React from "react";
import { Input } from "../input";
import { Button } from "../button";
import { Badge } from "../badge";
import { Trash2, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SizeCurveInputProps {
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
  totalQuantity?: number;
  availableSizes?: string[];
  className?: string;
  error?: boolean;
  disabled?: boolean;
}

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

const SizeCurveInput = React.forwardRef<HTMLDivElement, SizeCurveInputProps>(
  ({ 
    value = {}, 
    onChange, 
    totalQuantity = 0,
    availableSizes = DEFAULT_SIZES,
    className,
    error,
    disabled,
    ...props 
  }, ref) => {
    const [customSize, setCustomSize] = React.useState("");
    
    const currentTotal = Object.values(value).reduce((sum, qty) => sum + qty, 0);
    const isValidTotal = totalQuantity === 0 || currentTotal === totalQuantity;
    
    const updateSize = (size: string, quantity: number) => {
      const newValue = { ...value };
      if (quantity <= 0) {
        delete newValue[size];
      } else {
        newValue[size] = quantity;
      }
      onChange(newValue);
    };
    
    const addCustomSize = () => {
      if (customSize && !value[customSize]) {
        updateSize(customSize, 1);
        setCustomSize("");
      }
    };
    
    const removeSize = (size: string) => {
      const newValue = { ...value };
      delete newValue[size];
      onChange(newValue);
    };
    
    // Quick fill buttons for common distributions
    const quickFillOptions = [
      {
        label: "Equal Distribution",
        action: () => {
          const activeSizes = Object.keys(value).filter(size => value[size] > 0);
          if (activeSizes.length === 0 || totalQuantity === 0) return;
          
          const perSize = Math.floor(totalQuantity / activeSizes.length);
          const remainder = totalQuantity % activeSizes.length;
          
          const newValue: Record<string, number> = {};
          activeSizes.forEach((size, index) => {
            newValue[size] = perSize + (index < remainder ? 1 : 0);
          });
          onChange(newValue);
        },
      },
      {
        label: "Bell Curve (M/L Heavy)",
        action: () => {
          if (totalQuantity === 0) return;
          
          const distribution: Record<string, number> = {
            XS: 0.05,
            S: 0.15,
            M: 0.25,
            L: 0.25,
            XL: 0.20,
            "2XL": 0.10,
          };
          
          const newValue: Record<string, number> = {};
          Object.entries(distribution).forEach(([size, percentage]) => {
            newValue[size] = Math.round(totalQuantity * percentage);
          });
          
          // Adjust for rounding differences
          const actualTotal = Object.values(newValue).reduce((sum, qty) => sum + qty, 0);
          if (actualTotal !== totalQuantity) {
            newValue.M += totalQuantity - actualTotal;
          }
          
          onChange(newValue);
        },
      },
    ];
    
    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {/* Size Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {availableSizes.map((size) => (
            <div key={size} className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{size}</label>
              <Input
                type="number"
                min="0"
                value={value[size] || ""}
                onChange={(e) => updateSize(size, parseInt(e.target.value) || 0)}
                placeholder="0"
                className="text-center"
                disabled={disabled}
                error={error && !isValidTotal}
              />
            </div>
          ))}
        </div>
        
        {/* Custom Size Input */}
        {!disabled && (
          <div className="flex gap-2">
            <Input
              placeholder="Custom size (e.g., 4XL)"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && addCustomSize()}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addCustomSize}
              disabled={!customSize || !!value[customSize]}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Custom Sizes */}
        {Object.keys(value).filter(size => !availableSizes.includes(size)).length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Custom Sizes</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.keys(value)
                .filter(size => !availableSizes.includes(size))
                .map((size) => (
                  <div key={size} className="relative">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-medium text-gray-700">{size}</span>
                      {!disabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                          onClick={() => removeSize(size)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={value[size] || ""}
                      onChange={(e) => updateSize(size, parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="text-center"
                      disabled={disabled}
                      error={error && !isValidTotal}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {/* Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">Total: </span>
              <Badge variant={isValidTotal ? "success" : "destructive"}>
                {currentTotal}
                {totalQuantity > 0 && ` / ${totalQuantity}`}
              </Badge>
            </div>
            
            {!isValidTotal && totalQuantity > 0 && (
              <div className="text-sm text-red-600">
                Difference: {currentTotal - totalQuantity}
              </div>
            )}
          </div>
          
          {/* Quick Fill Buttons */}
          {!disabled && totalQuantity > 0 && (
            <div className="flex gap-2">
              {quickFillOptions.map((option, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={option.action}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

SizeCurveInput.displayName = "SizeCurveInput";

export { SizeCurveInput };