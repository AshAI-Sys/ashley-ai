"use client";
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
exports.GraphicEditingSection = GraphicEditingSection;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
const AVAILABLE_PRINT_LOCATIONS = [
    { value: "BODY_FRONT", label: "Body Front" },
    { value: "BODY_BACK", label: "Body Back" },
    { value: "SLEEVE_RIGHT", label: "Sleeve Right" },
    { value: "SLEEVE_LEFT", label: "Sleeve Left" },
    { value: "POCKET_RIGHT", label: "Pocket Right" },
    { value: "POCKET_LEFT", label: "Pocket Left" },
    { value: "LEG_RIGHT_FRONT", label: "Leg Right Front" },
    { value: "LEG_RIGHT_BACK", label: "Leg Right Back" },
    { value: "LEG_RIGHT_SIDE", label: "Leg Right Side" },
    { value: "LEG_LEFT_FRONT", label: "Leg Left Front" },
    { value: "LEG_LEFT_BACK", label: "Leg Left Back" },
    { value: "LEG_LEFT_SIDE", label: "Leg Left Side" },
    { value: "HOOD", label: "Hood" },
];
function GraphicEditingSection({ artistFilename, mockupImageUrl, notesRemarks, printLocations, onArtistFilenameChange, onMockupImageUrlChange, onNotesRemarksChange, onPrintLocationsChange, }) {
    const [imageLoading, setImageLoading] = (0, react_1.useState)(false);
    const [imageError, setImageError] = (0, react_1.useState)(false);
    const handleImageDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleImageUpload(file);
        }
        else {
            react_hot_toast_1.toast.error("Please drop an image file");
        }
    };
    const handleImageUpload = (file) => {
        setImageLoading(true);
        setImageError(false);
        // Create a local URL for the image
        const reader = new FileReader();
        reader.onload = e => {
            const imageUrl = e.target?.result;
            onMockupImageUrlChange(imageUrl);
            setImageLoading(false);
            react_hot_toast_1.toast.success("Mockup image uploaded");
        };
        reader.onerror = () => {
            setImageLoading(false);
            setImageError(true);
            react_hot_toast_1.toast.error("Failed to load image");
        };
        reader.readAsDataURL(file);
    };
    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
    };
    const downloadMockupImage = async () => {
        if (!mockupImageUrl)
            return;
        try {
            const response = await fetch(mockupImageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `mockup_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            react_hot_toast_1.toast.success("Mockup image downloaded");
        }
        catch (error) {
            console.error("Download error:", error);
            react_hot_toast_1.toast.error("Failed to download image");
        }
    };
    const togglePrintLocation = (locationValue) => {
        const exists = printLocations.find(loc => loc.location === locationValue);
        if (exists) {
            // Toggle selection
            const updated = printLocations.map(loc => loc.location === locationValue
                ? { ...loc, selected: !loc.selected }
                : loc);
            onPrintLocationsChange(updated);
        }
        else {
            // Add new location
            const locationConfig = AVAILABLE_PRINT_LOCATIONS.find(l => l.value === locationValue);
            if (locationConfig) {
                const newLocation = {
                    location: locationConfig.value,
                    location_label: locationConfig.label,
                    selected: true,
                };
                onPrintLocationsChange([...printLocations, newLocation]);
            }
        }
    };
    const updatePrintLocation = (locationValue, field, value) => {
        const updated = printLocations.map(loc => loc.location === locationValue ? { ...loc, [field]: value } : loc);
        onPrintLocationsChange(updated);
    };
    const removePrintLocation = (locationValue) => {
        const updated = printLocations.filter(loc => loc.location !== locationValue);
        onPrintLocationsChange(updated);
    };
    const selectedLocations = printLocations.filter(loc => loc.selected);
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Shirt className="h-5 w-5"/>
          Graphic Editing Section
          <badge_1.Badge variant="outline">Design Details</badge_1.Badge>
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Artist Filename */}
        <div>
          <label_1.Label htmlFor="artist-filename" className="flex items-center gap-2">
            <lucide_react_1.FileImage className="h-4 w-4"/>
            Artist Filename
          </label_1.Label>
          <input_1.Input id="artist-filename" value={artistFilename} onChange={e => onArtistFilenameChange(e.target.value)} placeholder="e.g., CLIENT_BRAND_DESIGN_v1.ai"/>
          <p className="mt-1 text-xs text-muted-foreground">
            Original filename from the artist/designer
          </p>
        </div>

        {/* Mockup Image URL */}
        <div>
          <label_1.Label htmlFor="mockup-url" className="flex items-center gap-2">
            <lucide_react_1.Image className="h-4 w-4"/>
            Mockup Image URL
          </label_1.Label>

          <div className="space-y-3">
            {/* URL Input */}
            <input_1.Input id="mockup-url" value={mockupImageUrl} onChange={e => onMockupImageUrlChange(e.target.value)} placeholder="https://... or drag & drop image below" type="text"/>

            {/* Drag & Drop Zone */}
            <div onDrop={handleImageDrop} onDragOver={e => e.preventDefault()} onDragEnter={e => e.preventDefault()} className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-colors hover:border-blue-400">
              <input type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" id="mockup-file-input"/>
              <label htmlFor="mockup-file-input" className="cursor-pointer">
                <lucide_react_1.Upload className="mx-auto mb-2 h-8 w-8 text-gray-700"/>
                <p className="text-sm font-medium text-gray-600">
                  Drag & drop image here or click to browse
                </p>
                <p className="mt-1 text-xs text-gray-700">
                  Supports JPG, PNG, GIF (Max 10MB)
                </p>
              </label>
            </div>

            {/* Image Preview */}
            {mockupImageUrl && (<div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <label_1.Label className="text-sm font-medium text-green-900">
                    Mockup Preview
                  </label_1.Label>
                  <button_1.Button variant="outline" size="sm" onClick={downloadMockupImage} className="h-8">
                    <lucide_react_1.Download className="mr-1 h-4 w-4"/>
                    Download
                  </button_1.Button>
                </div>

                {imageLoading ? (<div className="flex h-64 w-full items-center justify-center rounded bg-gray-100">
                    <div className="text-center">
                      <div className="mx-auto mb-2 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                      <p className="text-sm text-gray-600">Loading image...</p>
                    </div>
                  </div>) : imageError ? (<div className="flex h-64 w-full items-center justify-center rounded border border-red-200 bg-red-50">
                    <div className="text-center">
                      <lucide_react_1.X className="mx-auto mb-2 h-12 w-12 text-red-500"/>
                      <p className="text-sm text-red-600">
                        Failed to load image
                      </p>
                    </div>
                  </div>) : (<img src={mockupImageUrl} alt="Mockup preview" className="mx-auto w-full max-w-2xl rounded shadow-sm" onLoad={() => setImageError(false)} onError={() => {
                    setImageError(true);
                    react_hot_toast_1.toast.error("Failed to load mockup image");
                }}/>)}
              </div>)}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Link to the mockup/preview image or upload directly
          </p>
        </div>

        {/* Notes/Remarks */}
        <div>
          <label_1.Label htmlFor="notes-remarks">Notes/Remarks</label_1.Label>
          <textarea_1.Textarea id="notes-remarks" value={notesRemarks} onChange={e => onNotesRemarksChange(e.target.value)} placeholder="Add any special notes, design instructions, or remarks..." rows={3}/>
        </div>

        {/* Print Locations */}
        <div>
          <div className="mb-4">
            <label_1.Label className="text-base font-medium">Print Locations</label_1.Label>
            <p className="text-sm text-muted-foreground">
              Select where the design will be printed on the garment
            </p>
          </div>

          {/* Location Selection Grid */}
          <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {AVAILABLE_PRINT_LOCATIONS.map(location => {
            const isSelected = printLocations.some(loc => loc.location === location.value && loc.selected);
            return (<button key={location.value} onClick={() => togglePrintLocation(location.value)} className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50"} `}>
                  {location.label}
                </button>);
        })}
          </div>

          {/* Selected Locations Details */}
          {selectedLocations.length > 0 && (<div className="space-y-4">
              <div className="font-medium">
                Location Details ({selectedLocations.length} selected)
              </div>

              {selectedLocations.map(location => (<div key={location.location} className="space-y-4 rounded-lg border bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{location.location_label}</h4>
                    <button_1.Button variant="ghost" size="sm" onClick={() => removePrintLocation(location.location)}>
                      <lucide_react_1.X className="h-4 w-4"/>
                    </button_1.Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label_1.Label className="text-xs">Design File URL</label_1.Label>
                      <input_1.Input value={location.design_file_url || ""} onChange={e => updatePrintLocation(location.location, "design_file_url", e.target.value)} placeholder="https://..." className="text-sm"/>
                    </div>

                    <div>
                      <label_1.Label className="text-xs">Notes</label_1.Label>
                      <input_1.Input value={location.notes || ""} onChange={e => updatePrintLocation(location.location, "notes", e.target.value)} placeholder="Special instructions..." className="text-sm"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <label_1.Label className="text-xs">Width (cm)</label_1.Label>
                      <input_1.Input type="number" value={location.width_cm || ""} onChange={e => updatePrintLocation(location.location, "width_cm", parseFloat(e.target.value) || undefined)} placeholder="0.0" step="0.1" className="text-sm"/>
                    </div>

                    <div>
                      <label_1.Label className="text-xs">Height (cm)</label_1.Label>
                      <input_1.Input type="number" value={location.height_cm || ""} onChange={e => updatePrintLocation(location.location, "height_cm", parseFloat(e.target.value) || undefined)} placeholder="0.0" step="0.1" className="text-sm"/>
                    </div>

                    <div>
                      <label_1.Label className="text-xs">Offset X (cm)</label_1.Label>
                      <input_1.Input type="number" value={location.offset_x_cm || ""} onChange={e => updatePrintLocation(location.location, "offset_x_cm", parseFloat(e.target.value) || undefined)} placeholder="0.0" step="0.1" className="text-sm"/>
                    </div>

                    <div>
                      <label_1.Label className="text-xs">Offset Y (cm)</label_1.Label>
                      <input_1.Input type="number" value={location.offset_y_cm || ""} onChange={e => updatePrintLocation(location.location, "offset_y_cm", parseFloat(e.target.value) || undefined)} placeholder="0.0" step="0.1" className="text-sm"/>
                    </div>
                  </div>
                </div>))}
            </div>)}

          {selectedLocations.length === 0 && (<div className="rounded-lg border-2 border-dashed py-8 text-center text-muted-foreground">
              <lucide_react_1.Shirt className="mx-auto mb-2 h-12 w-12 opacity-50"/>
              <p>No print locations selected</p>
              <p className="text-sm">Select locations from the options above</p>
            </div>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
