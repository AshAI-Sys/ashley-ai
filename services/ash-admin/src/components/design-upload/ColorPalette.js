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
exports.default = ColorPalette;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
const PRESET_COLORS = [
    { hex: '#000000', name: 'Black' },
    { hex: '#FFFFFF', name: 'White' },
    { hex: '#FF0000', name: 'Red' },
    { hex: '#00FF00', name: 'Green' },
    { hex: '#0000FF', name: 'Blue' },
    { hex: '#FFFF00', name: 'Yellow' },
    { hex: '#FF00FF', name: 'Magenta' },
    { hex: '#00FFFF', name: 'Cyan' },
    { hex: '#808080', name: 'Gray' },
    { hex: '#800000', name: 'Maroon' },
    { hex: '#808000', name: 'Olive' },
    { hex: '#008000', name: 'Dark Green' },
    { hex: '#800080', name: 'Purple' },
    { hex: '#008080', name: 'Teal' },
    { hex: '#000080', name: 'Navy' },
    { hex: '#FFA500', name: 'Orange' }
];
function ColorPalette({ colors, onColorsChange, maxColors = 12, allowCustomNames = false, showColorInfo = true, className = '' }) {
    const [newColor, setNewColor] = (0, react_1.useState)('#000000');
    const [copiedColor, setCopiedColor] = (0, react_1.useState)(null);
    const addColor = (hexColor) => {
        if (colors.length >= maxColors) {
            react_hot_toast_1.toast.error(`Maximum ${maxColors} colors allowed`);
            return;
        }
        if (colors.includes(hexColor)) {
            react_hot_toast_1.toast.error('Color already in palette');
            return;
        }
        const updatedColors = [...colors, hexColor];
        onColorsChange(updatedColors);
        setNewColor('#000000');
    };
    const removeColor = (index) => {
        const updatedColors = colors.filter((_, i) => i !== index);
        onColorsChange(updatedColors);
    };
    const updateColor = (index, hexColor) => {
        const updatedColors = colors.map((color, i) => i === index ? hexColor : color);
        onColorsChange(updatedColors);
    };
    const copyToClipboard = async (color) => {
        try {
            await navigator.clipboard.writeText(color);
            setCopiedColor(color);
            setTimeout(() => setCopiedColor(null), 2000);
            react_hot_toast_1.toast.success('Color copied to clipboard');
        }
        catch (error) {
            react_hot_toast_1.toast.error('Failed to copy color');
        }
    };
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    const getContrastColor = (hex) => {
        const rgb = hexToRgb(hex);
        if (!rgb)
            return '#000000';
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF';
    };
    const getColorName = (hex) => {
        const preset = PRESET_COLORS.find(c => c.hex.toLowerCase() === hex.toLowerCase());
        return preset?.name || hex;
    };
    return (<div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <lucide_react_1.Palette className="w-5 h-5"/>
          <h3 className="text-lg font-semibold">Color Palette</h3>
          <badge_1.Badge variant="outline">{colors.length}/{maxColors}</badge_1.Badge>
        </div>
      </div>

      {/* Current Colors */}
      {colors.length > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Selected Colors ({colors.length})</card_1.CardTitle>
            <card_1.CardDescription>
              Click on colors to edit, or use the copy button to copy hex codes
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {colors.map((color, index) => (<div key={index} className="relative group">
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      {/* Color Swatch */}
                      <div className="relative">
                        <input type="color" value={color} onChange={(e) => updateColor(index, e.target.value)} className="w-12 h-12 border-2 border-white rounded-lg cursor-pointer shadow-sm" style={{ backgroundColor: color }}/>
                      </div>

                      {/* Color Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {getColorName(color)}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {color.toUpperCase()}
                        </div>
                        {showColorInfo && (() => {
                    const rgb = hexToRgb(color);
                    return rgb ? (<div className="text-xs text-muted-foreground">
                              RGB({rgb.r}, {rgb.g}, {rgb.b})
                            </div>) : null;
                })()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-2">
                      <button_1.Button variant="ghost" size="sm" onClick={() => copyToClipboard(color)} className="text-xs px-2 py-1 h-6">
                        {copiedColor === color ? (<lucide_react_1.Check className="w-3 h-3"/>) : (<lucide_react_1.Copy className="w-3 h-3"/>)}
                      </button_1.Button>
                      
                      <button_1.Button variant="ghost" size="sm" onClick={() => removeColor(index)} className="text-red-500 hover:text-red-700 text-xs px-2 py-1 h-6">
                        <lucide_react_1.X className="w-3 h-3"/>
                      </button_1.Button>
                    </div>
                  </div>
                </div>))}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Add New Color */}
      {colors.length < maxColors && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Add Color</card_1.CardTitle>
            <card_1.CardDescription>
              Add colors to your palette using the color picker or presets
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            {/* Color Picker */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label_1.Label>Custom Color:</label_1.Label>
                <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"/>
              </div>
              <input_1.Input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="#000000" className="w-24 font-mono text-sm" pattern="^#[0-9A-Fa-f]{6}$"/>
              <button_1.Button onClick={() => addColor(newColor)} size="sm">
                <lucide_react_1.Plus className="w-4 h-4 mr-1"/>
                Add
              </button_1.Button>
            </div>

            {/* Preset Colors */}
            <div>
              <label_1.Label className="text-sm font-medium mb-2 block">Quick Add:</label_1.Label>
              <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
                {PRESET_COLORS.map((preset, index) => (<button key={index} onClick={() => addColor(preset.hex)} className={`w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors ${colors.includes(preset.hex) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} style={{ backgroundColor: preset.hex }} title={preset.name} disabled={colors.includes(preset.hex)}/>))}
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Color Analysis */}
      {colors.length > 0 && showColorInfo && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Color Analysis</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{colors.length}</div>
                <div className="text-muted-foreground">Total Colors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {colors.filter(c => {
                const rgb = hexToRgb(c);
                return rgb && (rgb.r + rgb.g + rgb.b) / 3 > 128;
            }).length}
                </div>
                <div className="text-muted-foreground">Light Colors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {colors.filter(c => {
                const rgb = hexToRgb(c);
                return rgb && (rgb.r + rgb.g + rgb.b) / 3 <= 128;
            }).length}
                </div>
                <div className="text-muted-foreground">Dark Colors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {maxColors - colors.length}
                </div>
                <div className="text-muted-foreground">Remaining</div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Print Method Guidelines */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Color Guidelines</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent className="text-sm space-y-2">
          <div className="flex items-center gap-2 text-purple-600">
            <div className="w-2 h-2 bg-purple-600 rounded-full"/>
            <span><strong>Silkscreen:</strong> Maximum 6 colors recommended for cost efficiency</span>
          </div>
          <div className="flex items-center gap-2 text-cyan-600">
            <div className="w-2 h-2 bg-cyan-600 rounded-full"/>
            <span><strong>Sublimation:</strong> Unlimited colors, works best with light fabrics</span>
          </div>
          <div className="flex items-center gap-2 text-orange-600">
            <div className="w-2 h-2 bg-orange-600 rounded-full"/>
            <span><strong>DTF:</strong> Full color support with automatic white underbase</span>
          </div>
          <div className="flex items-center gap-2 text-pink-600">
            <div className="w-2 h-2 bg-pink-600 rounded-full"/>
            <span><strong>Embroidery:</strong> Limited colors, consider thread availability</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
