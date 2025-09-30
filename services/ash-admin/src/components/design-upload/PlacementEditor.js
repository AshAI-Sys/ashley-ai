'use client';
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
exports.default = PlacementEditor;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
const PLACEMENT_AREAS = [
    { value: 'front', label: 'Front', color: 'bg-blue-100 text-blue-800' },
    { value: 'back', label: 'Back', color: 'bg-green-100 text-green-800' },
    { value: 'left_chest', label: 'Left Chest', color: 'bg-purple-100 text-purple-800' },
    { value: 'right_chest', label: 'Right Chest', color: 'bg-pink-100 text-pink-800' },
    { value: 'sleeve', label: 'Sleeve', color: 'bg-orange-100 text-orange-800' },
    { value: 'all_over', label: 'All Over', color: 'bg-red-100 text-red-800' }
];
const GARMENT_TEMPLATES = {
    tshirt: {
        width: 50,
        height: 70,
        areas: {
            front: { maxWidth: 35, maxHeight: 40, defaultX: 7.5, defaultY: 15 },
            back: { maxWidth: 35, maxHeight: 40, defaultX: 7.5, defaultY: 15 },
            left_chest: { maxWidth: 10, maxHeight: 10, defaultX: 5, defaultY: 10 },
            right_chest: { maxWidth: 10, maxHeight: 10, defaultX: 35, defaultY: 10 },
            sleeve: { maxWidth: 15, maxHeight: 20, defaultX: 45, defaultY: 20 },
            all_over: { maxWidth: 50, maxHeight: 70, defaultX: 0, defaultY: 0 }
        }
    }
};
function PlacementEditor({ placements, onPlacementsChange, mockupUrl, className = '' }) {
    const [selectedPlacement, setSelectedPlacement] = (0, react_1.useState)(null);
    const [previewMode, setPreviewMode] = (0, react_1.useState)(false);
    const addPlacement = () => {
        const newId = `placement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newPlacement = {
            id: newId,
            area: 'front',
            width_cm: 20,
            height_cm: 25,
            offset_x: 7.5,
            offset_y: 15,
            rotation: 0
        };
        const updatedPlacements = [...placements, newPlacement];
        onPlacementsChange(updatedPlacements);
        setSelectedPlacement(newId);
    };
    const removePlacement = (id) => {
        if (placements.length <= 1) {
            react_hot_toast_1.toast.error('At least one placement is required');
            return;
        }
        const updatedPlacements = placements.filter(p => p.id !== id);
        onPlacementsChange(updatedPlacements);
        if (selectedPlacement === id) {
            setSelectedPlacement(updatedPlacements[0]?.id || null);
        }
    };
    const updatePlacement = (id, field, value) => {
        const updatedPlacements = placements.map(placement => {
            if (placement.id === id) {
                let updatedValue = value;
                // Validate dimensions based on area
                if (field === 'area') {
                    const template = GARMENT_TEMPLATES.tshirt.areas[value];
                    if (template) {
                        return {
                            ...placement,
                            area: value,
                            width_cm: Math.min(placement.width_cm, template.maxWidth),
                            height_cm: Math.min(placement.height_cm, template.maxHeight),
                            offset_x: template.defaultX,
                            offset_y: template.defaultY
                        };
                    }
                }
                // Validate dimensions
                if (field === 'width_cm' || field === 'height_cm') {
                    const template = GARMENT_TEMPLATES.tshirt.areas[placement.area];
                    if (template) {
                        const maxValue = field === 'width_cm' ? template.maxWidth : template.maxHeight;
                        updatedValue = Math.min(Math.max(0.1, parseFloat(value) || 0), maxValue);
                    }
                }
                // Validate offsets
                if (field === 'offset_x' || field === 'offset_y') {
                    updatedValue = parseFloat(value) || 0;
                }
                return { ...placement, [field]: updatedValue };
            }
            return placement;
        });
        onPlacementsChange(updatedPlacements);
    };
    const getAreaColor = (area) => {
        return PLACEMENT_AREAS.find(a => a.value === area)?.color || 'bg-gray-100 text-gray-800';
    };
    const getAreaLabel = (area) => {
        return PLACEMENT_AREAS.find(a => a.value === area)?.label || area;
    };
    // Calculate placement position on visual preview (as percentage)
    const getPlacementStyle = (placement) => {
        const template = GARMENT_TEMPLATES.tshirt;
        return {
            left: `${(placement.offset_x / template.width) * 100}%`,
            top: `${(placement.offset_y / template.height) * 100}%`,
            width: `${(placement.width_cm / template.width) * 100}%`,
            height: `${(placement.height_cm / template.height) * 100}%`,
            transform: placement.rotation ? `rotate(${placement.rotation}deg)` : undefined
        };
    };
    return (<div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Design Placements</h3>
          <p className="text-sm text-muted-foreground">
            Define where and how the design will be placed on the garment
          </p>
        </div>
        <div className="flex gap-2">
          <button_1.Button variant={previewMode ? "default" : "outline"} size="sm" onClick={() => setPreviewMode(!previewMode)}>
            <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </button_1.Button>
          <button_1.Button onClick={addPlacement} size="sm" variant="outline">
            <lucide_react_1.Plus className="w-4 h-4 mr-1"/>
            Add Placement
          </button_1.Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Visual Editor */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Maximize className="w-4 h-4"/>
              Visual Preview
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="relative bg-gray-50 rounded-lg p-6 min-h-[400px]">
              {/* Garment Template */}
              <div className="relative mx-auto bg-white border-2 border-gray-300 rounded-lg" style={{
            width: '280px',
            height: '400px'
        }}>
                {/* Mockup Image */}
                {mockupUrl && (<img src={mockupUrl} alt="Design mockup" className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-30"/>)}
                
                {/* Placement Overlays */}
                {placements.map(placement => (<div key={placement.id} className={`absolute border-2 border-blue-500 rounded cursor-pointer transition-all ${selectedPlacement === placement.id
                ? 'bg-blue-200 bg-opacity-50 border-blue-600'
                : 'bg-blue-100 bg-opacity-30 hover:bg-opacity-50'}`} style={getPlacementStyle(placement)} onClick={() => setSelectedPlacement(placement.id)}>
                    <div className="absolute -top-6 left-0 text-xs font-medium text-blue-600">
                      {getAreaLabel(placement.area)}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-blue-600 font-medium">
                      {placement.width_cm}×{placement.height_cm}
                    </div>
                    
                    {/* Resize handles */}
                    {selectedPlacement === placement.id && !previewMode && (<>
                        <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-blue-600 rounded-full cursor-se-resize"/>
                        <div className="absolute -right-1 top-1/2 w-3 h-3 bg-blue-600 rounded-full cursor-e-resize -translate-y-1/2"/>
                        <div className="absolute -bottom-1 left-1/2 w-3 h-3 bg-blue-600 rounded-full cursor-s-resize -translate-x-1/2"/>
                      </>)}
                  </div>))}
                
                {/* Garment Guide Lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Center lines */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 opacity-50 -translate-x-px"/>
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 opacity-50 -translate-y-px"/>
                </div>
              </div>
              
              {/* Grid overlay for precise positioning */}
              {selectedPlacement && !previewMode && (<div className="absolute inset-0 pointer-events-none opacity-20">
                  <svg className="w-full h-full">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#000" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)"/>
                  </svg>
                </div>)}
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Properties Panel */}
        <div className="space-y-4">
          {/* Placement List */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Placements ({placements.length})</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-2">
                {placements.map((placement, index) => (<div key={placement.id} className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedPlacement === placement.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setSelectedPlacement(placement.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <badge_1.Badge className={getAreaColor(placement.area)} variant="outline">
                          {getAreaLabel(placement.area)}
                        </badge_1.Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {placement.width_cm}×{placement.height_cm}cm
                        </span>
                        {placements.length > 1 && (<button_1.Button variant="ghost" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    removePlacement(placement.id);
                }} className="text-red-500 hover:text-red-700 h-6 w-6 p-0">
                            <lucide_react_1.Minus className="w-3 h-3"/>
                          </button_1.Button>)}
                      </div>
                    </div>
                  </div>))}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Selected Placement Properties */}
          {selectedPlacement && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Placement Properties</card_1.CardTitle>
                <card_1.CardDescription>
                  Edit the selected placement settings
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {(() => {
                const placement = placements.find(p => p.id === selectedPlacement);
                if (!placement)
                    return null;
                return (<>
                      {/* Area Selection */}
                      <div>
                        <label_1.Label>Placement Area</label_1.Label>
                        <select_1.Select value={placement.area} onValueChange={(value) => updatePlacement(placement.id, 'area', value)}>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue />
                          </select_1.SelectTrigger>
                          <select_1.SelectContent>
                            {PLACEMENT_AREAS.map(area => (<select_1.SelectItem key={area.value} value={area.value}>
                                {area.label}
                              </select_1.SelectItem>))}
                          </select_1.SelectContent>
                        </select_1.Select>
                      </div>

                      {/* Dimensions */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label_1.Label>Width (cm)</label_1.Label>
                          <input_1.Input type="number" value={placement.width_cm} onChange={(e) => updatePlacement(placement.id, 'width_cm', e.target.value)} min="0.1" step="0.1" max={GARMENT_TEMPLATES.tshirt.areas[placement.area]?.maxWidth || 50}/>
                        </div>
                        <div>
                          <label_1.Label>Height (cm)</label_1.Label>
                          <input_1.Input type="number" value={placement.height_cm} onChange={(e) => updatePlacement(placement.id, 'height_cm', e.target.value)} min="0.1" step="0.1" max={GARMENT_TEMPLATES.tshirt.areas[placement.area]?.maxHeight || 70}/>
                        </div>
                      </div>

                      {/* Position */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label_1.Label>Offset X (cm)</label_1.Label>
                          <input_1.Input type="number" value={placement.offset_x} onChange={(e) => updatePlacement(placement.id, 'offset_x', e.target.value)} step="0.1"/>
                        </div>
                        <div>
                          <label_1.Label>Offset Y (cm)</label_1.Label>
                          <input_1.Input type="number" value={placement.offset_y} onChange={(e) => updatePlacement(placement.id, 'offset_y', e.target.value)} step="0.1"/>
                        </div>
                      </div>

                      {/* Rotation */}
                      <div>
                        <label_1.Label>Rotation (degrees)</label_1.Label>
                        <div className="flex gap-2">
                          <input_1.Input type="number" value={placement.rotation || 0} onChange={(e) => updatePlacement(placement.id, 'rotation', parseFloat(e.target.value) || 0)} min="-180" max="180" step="1"/>
                          <button_1.Button variant="outline" size="sm" onClick={() => updatePlacement(placement.id, 'rotation', ((placement.rotation || 0) + 90) % 360)}>
                            <lucide_react_1.RotateCw className="w-4 h-4"/>
                          </button_1.Button>
                        </div>
                      </div>
                    </>);
            })()}
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Guidelines */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Placement Guidelines</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="text-sm space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full"/>
                <span>Front: Best for main designs and logos</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"/>
                <span>Back: Perfect for large graphics</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <div className="w-2 h-2 bg-purple-600 rounded-full"/>
                <span>Left Chest: Small logos and text</span>
              </div>
              <div className="flex items-center gap-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-600 rounded-full"/>
                <span>Sleeve: Accent designs</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full"/>
                <span>All Over: Full coverage prints</span>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </div>);
}
