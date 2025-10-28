"use client";

import { useState, useEffect } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, X, Plus, Save, RotateCcw, Lock, Unlock } from "lucide-react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import ProductionTrendChart from "../charts/ProductionTrendChart";
import EfficiencyGaugeChart from "../charts/EfficiencyGaugeChart";
import RealTimeMetrics from "./RealTimeMetrics";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

const availableWidgets: Widget[] = [
  {
    id: "real-time-metrics",
    title: "Real-Time Metrics",
    component: RealTimeMetrics,
    minW: 4,
    minH: 2,
  },
  {
    id: "production-trends",
    title: "Production Trends",
    component: ProductionTrendChart as React.ComponentType<any>,
    minW: 4,
    minH: 3,
  },
  {
    id: "efficiency-gauge",
    title: "Efficiency Gauge",
    component: EfficiencyGaugeChart as React.ComponentType<any>,
    minW: 3,
    minH: 3,
  },
];

const defaultLayout: Layout[] = [
  { i: "real-time-metrics", x: 0, y: 0, w: 12, h: 2, minW: 4, minH: 2 },
  { i: "production-trends", x: 0, y: 2, w: 8, h: 3, minW: 4, minH: 3 },
  { i: "efficiency-gauge", x: 8, y: 2, w: 4, h: 3, minW: 3, minH: 3 },
];

export default function CustomizableDashboard() {
  const [layouts, setLayouts] = useState<{ lg: Layout[] }>({
    lg: defaultLayout,
  });
  const [activeWidgets, setActiveWidgets] = useState<string[]>(
    defaultLayout.map((l) => l.i)
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLocked, setIsLocked] = useState(true);

  // Load saved layout from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem("dashboard-layout");
    const savedWidgets = localStorage.getItem("dashboard-widgets");

    if (savedLayout) {
      setLayouts({ lg: JSON.parse(savedLayout) });
    }
    if (savedWidgets) {
      setActiveWidgets(JSON.parse(savedWidgets));
    }
  }, []);

  const handleLayoutChange = (layout: Layout[]) => {
    setLayouts({ lg: layout });
  };

  const handleSaveLayout = () => {
    localStorage.setItem("dashboard-layout", JSON.stringify(layouts.lg));
    localStorage.setItem("dashboard-widgets", JSON.stringify(activeWidgets));
    setIsEditMode(false);
    setIsLocked(true);
  };

  const handleResetLayout = () => {
    setLayouts({ lg: defaultLayout });
    setActiveWidgets(defaultLayout.map((l) => l.i));
    localStorage.removeItem("dashboard-layout");
    localStorage.removeItem("dashboard-widgets");
  };

  const handleAddWidget = (widgetId: string) => {
    if (activeWidgets.includes(widgetId)) return;

    const newWidget = availableWidgets.find((w) => w.id === widgetId);
    if (!newWidget) return;

    const newLayout: Layout = {
      i: widgetId,
      x: 0,
      y: Infinity, // Place at bottom
      w: newWidget.minW || 4,
      h: newWidget.minH || 2,
      minW: newWidget.minW,
      minH: newWidget.minH,
      maxW: newWidget.maxW,
      maxH: newWidget.maxH,
    };

    setLayouts({ lg: [...layouts.lg, newLayout] });
    setActiveWidgets([...activeWidgets, widgetId]);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setLayouts({ lg: layouts.lg.filter((l) => l.i !== widgetId) });
    setActiveWidgets(activeWidgets.filter((id) => id !== widgetId));
  };

  const renderWidget = (widgetId: string) => {
    const widget = availableWidgets.find((w) => w.id === widgetId);
    if (!widget) return null;

    const WidgetComponent = widget.component;

    return (
      <div key={widgetId} className="widget-container">
        {isEditMode && (
          <button
            onClick={() => handleRemoveWidget(widgetId)}
            className="absolute right-2 top-2 z-10 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <WidgetComponent />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Dashboard Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Customizable Dashboard
              </h2>
              <p className="text-sm text-gray-600">
                {isEditMode
                  ? "Drag widgets to rearrange, resize by dragging corners"
                  : "Click customize to edit your dashboard layout"}
              </p>
            </div>

            <div className="flex gap-2">
              {/* Lock/Unlock Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLocked(!isLocked)}
              >
                {isLocked ? (
                  <>
                    <Lock className="mr-1 h-4 w-4" />
                    Locked
                  </>
                ) : (
                  <>
                    <Unlock className="mr-1 h-4 w-4" />
                    Unlocked
                  </>
                )}
              </Button>

              {isEditMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleResetLayout}>
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveLayout}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="mr-1 h-4 w-4" />
                    Save Layout
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditMode(false);
                      setIsLocked(true);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditMode(true);
                    setIsLocked(false);
                  }}
                >
                  <Settings className="mr-1 h-4 w-4" />
                  Customize
                </Button>
              )}
            </div>
          </div>

          {/* Widget Selector (Edit Mode Only) */}
          {isEditMode && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="mb-3 text-sm font-medium text-gray-900">
                Add Widgets:
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableWidgets.map((widget) => {
                  const isActive = activeWidgets.includes(widget.id);
                  return (
                    <button
                      key={widget.id}
                      onClick={() => !isActive && handleAddWidget(widget.id)}
                      disabled={isActive}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "cursor-not-allowed bg-gray-100 text-gray-500"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      {widget.title}
                      {isActive && <span className="text-xs">(Active)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={!isLocked}
        isResizable={!isLocked}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        compactType="vertical"
        preventCollision={false}
      >
        {activeWidgets.map(renderWidget)}
      </ResponsiveGridLayout>

      {/* Instructions */}
      {isEditMode && (
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Settings className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <h3 className="mb-1 text-sm font-medium text-gray-900">
                  Customization Tips:
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Drag widgets to rearrange their position</li>
                  <li>• Resize widgets by dragging the bottom-right corner</li>
                  <li>• Click the X button to remove a widget</li>
                  <li>• Add new widgets using the buttons above</li>
                  <li>• Click "Save Layout" to persist your changes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSS for grid layout */}
      <style jsx global>{`
        .widget-container {
          height: 100%;
          position: relative;
        }
        .react-grid-item {
          transition: all 200ms ease;
          transition-property: left, top, width, height;
        }
        .react-grid-item.cssTransforms {
          transition-property: transform, width, height;
        }
        .react-grid-item.resizing {
          transition: none;
          z-index: 100;
        }
        .react-grid-item.react-draggable-dragging {
          transition: none;
          z-index: 100;
          cursor: move;
        }
        .react-grid-item.dropping {
          visibility: hidden;
        }
        .react-grid-item.react-grid-placeholder {
          background: rgba(59, 130, 246, 0.15);
          opacity: 0.5;
          transition-duration: 100ms;
          z-index: 2;
          border-radius: 8px;
          border: 2px dashed #3b82f6;
        }
        .react-grid-item > .react-resizable-handle {
          position: absolute;
          width: 20px;
          height: 20px;
        }
        .react-grid-item > .react-resizable-handle::after {
          content: "";
          position: absolute;
          right: 3px;
          bottom: 3px;
          width: 10px;
          height: 10px;
          border-right: 2px solid rgba(0, 0, 0, 0.4);
          border-bottom: 2px solid rgba(0, 0, 0, 0.4);
        }
        .react-grid-item:hover > .react-resizable-handle::after {
          border-color: rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
}
