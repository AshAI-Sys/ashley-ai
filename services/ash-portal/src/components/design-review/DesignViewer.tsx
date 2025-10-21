"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ash-ai/ui/card";
import { Button } from "@ash-ai/ui/button";
import { Badge } from "@ash-ai/ui/badge";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize,
  Eye,
  Grid,
  Move,
  Image as ImageIcon,
} from "lucide-react";

interface DesignFile {
  mockup_url?: string;
  prod_url?: string;
  separations?: string[];
  dst_url?: string;
}

interface DesignViewerProps {
  files: DesignFile;
  designName: string;
  version: number;
  className?: string;
}

export function DesignViewer({
  files,
  designName,
  version,
  className = "",
}: DesignViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [selectedView, setSelectedView] = useState<
    "mockup" | "production" | "separations"
  >("mockup");
  const [separationIndex, setSeparationIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Design Viewer
            <Badge variant="outline">v{version}</Badge>
          </CardTitle>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border p-1">
              {files.mockup_url && (
                <Button
                  size="sm"
                  variant={selectedView === "mockup" ? "default" : "ghost"}
                  onClick={() => setSelectedView("mockup")}
                  className="h-8 px-3"
                >
                  Mockup
                </Button>
              )}
              {files.prod_url && (
                <Button
                  size="sm"
                  variant={selectedView === "production" ? "default" : "ghost"}
                  onClick={() => setSelectedView("production")}
                  className="h-8 px-3"
                >
                  Production
                </Button>
              )}
              {files.separations && files.separations.length > 0 && (
                <Button
                  size="sm"
                  variant={selectedView === "separations" ? "default" : "ghost"}
                  onClick={() => setSelectedView("separations")}
                  className="h-8 px-3"
                >
                  Separations
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Separations Navigation */}
        {selectedView === "separations" &&
          files.separations &&
          files.separations.length > 1 && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-sm font-medium">
                Separation {separationIndex + 1} of {files.separations.length}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setSeparationIndex(prev => Math.max(0, prev - 1))
                  }
                  disabled={separationIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setSeparationIndex(prev =>
                      Math.min(files.separations!.length - 1, prev + 1)
                    )
                  }
                  disabled={separationIndex === files.separations.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

        {/* Image Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <span className="min-w-[60px] text-center font-mono text-sm">
              {zoom}%
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Button size="sm" variant="outline" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>

            <Button size="sm" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>

          <div className="flex gap-2">
            {currentImageUrl && (
              <>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={currentImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View Full
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={currentImageUrl}
                    download={`${designName}-v${version}-${selectedView}`}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Image Display */}
        <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
          {currentImageUrl ? (
            <div className="relative flex h-full w-full items-center justify-center p-4">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              )}

              {!imageError ? (
                <img
                  src={currentImageUrl}
                  alt={`${designName} - ${selectedView}`}
                  className="max-h-full max-w-full object-contain transition-transform duration-200 ease-in-out"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                  }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <div className="py-12 text-center">
                  <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-gray-500">Failed to load image</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setImageError(false);
                      setImageLoading(true);
                    }}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">
                No image available for {selectedView}
              </p>
            </div>
          )}
        </div>

        {/* File Information */}
        <div className="text-muted-foreground space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Current View:</span>
            <span className="font-medium capitalize">{selectedView}</span>
          </div>
          {selectedView === "separations" && files.separations && (
            <div className="flex justify-between">
              <span>Total Separations:</span>
              <span className="font-medium">{files.separations.length}</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 border-t pt-2">
          {files.mockup_url && (
            <Button size="sm" variant="outline" asChild>
              <a
                href={files.mockup_url}
                download={`${designName}-v${version}-mockup`}
              >
                <Download className="mr-1 h-3 w-3" />
                Mockup
              </a>
            </Button>
          )}
          {files.prod_url && (
            <Button size="sm" variant="outline" asChild>
              <a
                href={files.prod_url}
                download={`${designName}-v${version}-production`}
              >
                <Download className="mr-1 h-3 w-3" />
                Production File
              </a>
            </Button>
          )}
          {files.dst_url && (
            <Button size="sm" variant="outline" asChild>
              <a
                href={files.dst_url}
                download={`${designName}-v${version}-embroidery`}
              >
                <Download className="mr-1 h-3 w-3" />
                Embroidery File
              </a>
            </Button>
          )}
          {files.separations && files.separations.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                files.separations?.forEach((url, index) => {
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${designName}-v${version}-separation-${index + 1}`;
                  a.click();
                });
              }}
            >
              <Download className="mr-1 h-3 w-3" />
              All Separations
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
