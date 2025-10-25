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
exports.DesignViewer = DesignViewer;
const react_1 = __importStar(require("react"));
const card_1 = require("@ash-ai/ui/card");
const button_1 = require("@ash-ai/ui/button");
const badge_1 = require("@ash-ai/ui/badge");
const lucide_react_1 = require("lucide-react");
function DesignViewer({ files, designName, version, className = "", }) {
    const [zoom, setZoom] = (0, react_1.useState)(100);
    const [rotation, setRotation] = (0, react_1.useState)(0);
    const [selectedView, setSelectedView] = (0, react_1.useState)("mockup");
    const [separationIndex, setSeparationIndex] = (0, react_1.useState)(0);
    const [fullscreen, setFullscreen] = (0, react_1.useState)(false);
    const [imageError, setImageError] = (0, react_1.useState)(false);
    const [imageLoading, setImageLoading] = (0, react_1.useState)(true);
    const getCurrentImageUrl = () => {
        switch (selectedView) {
            case "mockup":
                return files.mockup_url;
            case "production":
                return files.prod_url;
            case "separations":
                return files.separations?.[separationIndex];
            default:
                return files.mockup_url;
        }
    };
    const handleZoomIn = () => {
        setZoom(prev => Math.min(200, prev + 25));
    };
    const handleZoomOut = () => {
        setZoom(prev => Math.max(25, prev - 25));
    };
    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };
    const handleReset = () => {
        setZoom(100);
        setRotation(0);
    };
    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };
    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };
    const currentImageUrl = getCurrentImageUrl();
    return (<card_1.Card className={className}>
      <card_1.CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Image className="h-5 w-5"/>
            Design Viewer
            <badge_1.Badge variant="outline">v{version}</badge_1.Badge>
          </card_1.CardTitle>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border p-1">
              {files.mockup_url && (<button_1.Button size="sm" variant={selectedView === "mockup" ? "default" : "ghost"} onClick={() => setSelectedView("mockup")} className="h-8 px-3">
                  Mockup
                </button_1.Button>)}
              {files.prod_url && (<button_1.Button size="sm" variant={selectedView === "production" ? "default" : "ghost"} onClick={() => setSelectedView("production")} className="h-8 px-3">
                  Production
                </button_1.Button>)}
              {files.separations && files.separations.length > 0 && (<button_1.Button size="sm" variant={selectedView === "separations" ? "default" : "ghost"} onClick={() => setSelectedView("separations")} className="h-8 px-3">
                  Separations
                </button_1.Button>)}
            </div>
          </div>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-4">
        {/* Separations Navigation */}
        {selectedView === "separations" &&
            files.separations &&
            files.separations.length > 1 && (<div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm font-medium">
                Separation {separationIndex + 1} of {files.separations.length}
              </span>
              <div className="flex gap-2">
                <button_1.Button size="sm" variant="outline" onClick={() => setSeparationIndex(prev => Math.max(0, prev - 1))} disabled={separationIndex === 0}>
                  Previous
                </button_1.Button>
                <button_1.Button size="sm" variant="outline" onClick={() => setSeparationIndex(prev => Math.min(files.separations.length - 1, prev + 1))} disabled={separationIndex === files.separations.length - 1}>
                  Next
                </button_1.Button>
              </div>
            </div>)}

        {/* Image Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button_1.Button size="sm" variant="outline" onClick={handleZoomOut} disabled={zoom <= 25}>
              <lucide_react_1.ZoomOut className="h-4 w-4"/>
            </button_1.Button>

            <span className="min-w-[60px] text-center font-mono text-sm">
              {zoom}%
            </span>

            <button_1.Button size="sm" variant="outline" onClick={handleZoomIn} disabled={zoom >= 200}>
              <lucide_react_1.ZoomIn className="h-4 w-4"/>
            </button_1.Button>

            <button_1.Button size="sm" variant="outline" onClick={handleRotate}>
              <lucide_react_1.RotateCw className="h-4 w-4"/>
            </button_1.Button>

            <button_1.Button size="sm" variant="outline" onClick={handleReset}>
              Reset
            </button_1.Button>
          </div>

          <div className="flex gap-2">
            {currentImageUrl && (<>
                <button_1.Button size="sm" variant="outline" asChild>
                  <a href={currentImageUrl} target="_blank" rel="noopener noreferrer">
                    <lucide_react_1.Eye className="mr-1 h-4 w-4"/>
                    View Full
                  </a>
                </button_1.Button>
                <button_1.Button size="sm" variant="outline" asChild>
                  <a href={currentImageUrl} download={`${designName}-v${version}-${selectedView}`}>
                    <lucide_react_1.Download className="mr-1 h-4 w-4"/>
                    Download
                  </a>
                </button_1.Button>
              </>)}
          </div>
        </div>

        {/* Image Display */}
        <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
          {currentImageUrl ? (<div className="relative flex h-full w-full items-center justify-center p-4">
              {imageLoading && (<div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>)}

              {!imageError ? (<img src={currentImageUrl} alt={`${designName} - ${selectedView}`} className="max-h-full max-w-full object-contain transition-transform duration-200 ease-in-out" style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                }} onLoad={handleImageLoad} onError={handleImageError}/>) : (<div className="py-12 text-center">
                  <lucide_react_1.Image className="mx-auto mb-4 h-12 w-12 text-gray-400"/>
                  <p className="mb-2 text-gray-500">Failed to load image</p>
                  <button_1.Button size="sm" variant="outline" onClick={() => {
                    setImageError(false);
                    setImageLoading(true);
                }}>
                    Retry
                  </button_1.Button>
                </div>)}
            </div>) : (<div className="py-12 text-center">
              <lucide_react_1.Image className="mx-auto mb-4 h-12 w-12 text-gray-400"/>
              <p className="text-gray-500">
                No image available for {selectedView}
              </p>
            </div>)}
        </div>

        {/* File Information */}
        <div className="text-muted-foreground space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Current View:</span>
            <span className="font-medium capitalize">{selectedView}</span>
          </div>
          {selectedView === "separations" && files.separations && (<div className="flex justify-between">
              <span>Total Separations:</span>
              <span className="font-medium">{files.separations.length}</span>
            </div>)}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 border-t pt-2">
          {files.mockup_url && (<button_1.Button size="sm" variant="outline" asChild>
              <a href={files.mockup_url} download={`${designName}-v${version}-mockup`}>
                <lucide_react_1.Download className="mr-1 h-3 w-3"/>
                Mockup
              </a>
            </button_1.Button>)}
          {files.prod_url && (<button_1.Button size="sm" variant="outline" asChild>
              <a href={files.prod_url} download={`${designName}-v${version}-production`}>
                <lucide_react_1.Download className="mr-1 h-3 w-3"/>
                Production File
              </a>
            </button_1.Button>)}
          {files.dst_url && (<button_1.Button size="sm" variant="outline" asChild>
              <a href={files.dst_url} download={`${designName}-v${version}-embroidery`}>
                <lucide_react_1.Download className="mr-1 h-3 w-3"/>
                Embroidery File
              </a>
            </button_1.Button>)}
          {files.separations && files.separations.length > 0 && (<button_1.Button size="sm" variant="outline" onClick={() => {
                files.separations?.forEach((url, index) => {
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${designName}-v${version}-separation-${index + 1}`;
                    a.click();
                });
            }}>
              <lucide_react_1.Download className="mr-1 h-3 w-3"/>
              All Separations
            </button_1.Button>)}
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
