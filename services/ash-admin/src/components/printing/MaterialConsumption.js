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
exports.default = MaterialConsumption;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const dialog_1 = require("@/components/ui/dialog");
const lucide_react_1 = require("lucide-react");
function MaterialConsumption({ runId, method, onUpdate, readOnly = false }) {
    const [materials, setMaterials] = (0, react_1.useState)([]);
    const [consumedMaterials, setConsumedMaterials] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [showAddDialog, setShowAddDialog] = (0, react_1.useState)(false);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [selectedType, setSelectedType] = (0, react_1.useState)('');
    const [materialTypes, setMaterialTypes] = (0, react_1.useState)([]);
    const [newConsumption, setNewConsumption] = (0, react_1.useState)({
        material_id: '',
        quantity: '',
        notes: ''
    });
    (0, react_1.useEffect)(() => {
        fetchMaterials();
        fetchMaterialTypes();
        fetchExistingConsumption();
    }, []);
    (0, react_1.useEffect)(() => {
        if (searchTerm || selectedType) {
            fetchMaterials();
        }
    }, [searchTerm, selectedType]);
    const fetchMaterials = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedType)
                params.append('type', selectedType);
            if (searchTerm)
                params.append('search', searchTerm);
            const response = await fetch(`/api/printing/materials?${params}`);
            if (response.ok) {
                const data = await response.json();
                setMaterials(data.data || []);
            }
            else {
                // Mock data for demo
                setMaterials([
                    {
                        id: '1',
                        name: 'Plastisol Ink - Black',
                        type: 'INK',
                        supplier: 'Union Ink',
                        unit: 'g',
                        current_stock: 5000,
                        available_stock: 4500,
                        cost_per_unit: 0.05,
                        batch_number: 'PI-BLK-001',
                        location: 'A1-B2'
                    },
                    {
                        id: '2',
                        name: 'Sublimation Paper - A3',
                        type: 'PAPER',
                        supplier: 'TexPrint',
                        unit: 'sheets',
                        current_stock: 1000,
                        available_stock: 850,
                        cost_per_unit: 0.25,
                        batch_number: 'SP-A3-202501',
                        location: 'B2-C1'
                    },
                    {
                        id: '3',
                        name: 'DTF Hot Melt Powder',
                        type: 'POWDER',
                        supplier: 'DTF Supplies',
                        unit: 'g',
                        current_stock: 2000,
                        available_stock: 1800,
                        cost_per_unit: 0.08,
                        batch_number: 'HMP-001',
                        location: 'C1-D3'
                    },
                    {
                        id: '4',
                        name: 'Embroidery Thread - Navy',
                        type: 'THREAD',
                        supplier: 'Madeira',
                        color: 'Navy Blue',
                        unit: 'm',
                        current_stock: 500,
                        available_stock: 450,
                        cost_per_unit: 0.02,
                        batch_number: 'ET-NAV-001',
                        location: 'D3-E1'
                    }
                ]);
            }
        }
        catch (error) {
            console.error('Error fetching materials:', error);
        }
    };
    const fetchMaterialTypes = async () => {
        try {
            const response = await fetch('/api/printing/materials', { method: 'OPTIONS' });
            if (response.ok) {
                const data = await response.json();
                setMaterialTypes(data.data || []);
            }
            else {
                setMaterialTypes(['INK', 'PAPER', 'POWDER', 'THREAD', 'FILM', 'STABILIZER']);
            }
        }
        catch (error) {
            console.error('Error fetching material types:', error);
            setMaterialTypes(['INK', 'PAPER', 'POWDER', 'THREAD', 'FILM', 'STABILIZER']);
        }
    };
    const fetchExistingConsumption = async () => {
        // This would fetch existing material consumption for the run
        // For now, we'll start with empty array
        setConsumedMaterials([]);
    };
    const addMaterial = () => {
        const selectedMaterial = materials.find(m => m.id === newConsumption.material_id);
        if (!selectedMaterial || !newConsumption.quantity)
            return;
        const quantity = parseFloat(newConsumption.quantity);
        if (quantity <= 0)
            return;
        // Check if material already consumed
        const existingIndex = consumedMaterials.findIndex(c => c.material_id === selectedMaterial.id);
        if (existingIndex >= 0) {
            // Update existing consumption
            const updated = [...consumedMaterials];
            updated[existingIndex] = {
                ...updated[existingIndex],
                quantity: updated[existingIndex].quantity + quantity,
                cost: (updated[existingIndex].quantity + quantity) * (selectedMaterial.cost_per_unit || 0),
                notes: newConsumption.notes || updated[existingIndex].notes
            };
            setConsumedMaterials(updated);
        }
        else {
            // Add new consumption
            const newItem = {
                material_id: selectedMaterial.id,
                material_name: selectedMaterial.name,
                quantity,
                unit: selectedMaterial.unit,
                cost: quantity * (selectedMaterial.cost_per_unit || 0),
                batch_id: selectedMaterial.batch_number,
                notes: newConsumption.notes
            };
            setConsumedMaterials([...consumedMaterials, newItem]);
        }
        // Reset form
        setNewConsumption({ material_id: '', quantity: '', notes: '' });
        setShowAddDialog(false);
        // Notify parent component
        onUpdate?.(consumedMaterials);
    };
    const removeMaterial = (materialId) => {
        const updated = consumedMaterials.filter(c => c.material_id !== materialId);
        setConsumedMaterials(updated);
        onUpdate?.(updated);
    };
    const saveMaterialConsumption = async () => {
        if (consumedMaterials.length === 0)
            return;
        try {
            setLoading(true);
            const response = await fetch('/api/printing/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    run_id: runId,
                    materials: consumedMaterials.map(m => ({
                        material_id: m.material_id,
                        quantity: m.quantity,
                        unit: m.unit,
                        batch_id: m.batch_id,
                        notes: m.notes
                    }))
                })
            });
            if (response.ok) {
                // Material consumption saved successfully
                console.log('Material consumption saved');
            }
            else {
                console.error('Failed to save material consumption');
            }
        }
        catch (error) {
            console.error('Error saving material consumption:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getTotalCost = () => {
        return consumedMaterials.reduce((sum, material) => sum + material.cost, 0);
    };
    const getMethodSpecificMaterials = () => {
        const methodMaterials = {
            SILKSCREEN: ['INK', 'EMULSION', 'SCREEN'],
            SUBLIMATION: ['INK', 'PAPER'],
            DTF: ['INK', 'FILM', 'POWDER'],
            EMBROIDERY: ['THREAD', 'STABILIZER', 'BOBBIN']
        };
        return methodMaterials[method] || [];
    };
    const getRelevantMaterials = () => {
        const methodTypes = getMethodSpecificMaterials();
        if (methodTypes.length === 0)
            return materials;
        return materials.filter(m => methodTypes.includes(m.type));
    };
    return (<div className="space-y-6">
      {/* Summary Card */}
      <card_1.Card className="border-l-4 border-l-orange-500">
        <card_1.CardHeader>
          <div className="flex items-center gap-2">
            <lucide_react_1.Package2 className="w-5 h-5 text-orange-600"/>
            <div>
              <card_1.CardTitle>Material Consumption Summary</card_1.CardTitle>
              <card_1.CardDescription>Track materials used for {method} printing</card_1.CardDescription>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{consumedMaterials.length}</div>
              <p className="text-sm text-muted-foreground">Materials Used</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">₱{getTotalCost().toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {consumedMaterials.reduce((sum, m) => sum + m.quantity, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Quantity</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Material Consumption List */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle>Consumed Materials</card_1.CardTitle>
            <div className="flex gap-2">
              {!readOnly && (<dialog_1.Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <dialog_1.DialogTrigger asChild>
                    <button_1.Button size="sm">
                      <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                      Add Material
                    </button_1.Button>
                  </dialog_1.DialogTrigger>
                  <dialog_1.DialogContent className="max-w-2xl">
                    <dialog_1.DialogHeader>
                      <dialog_1.DialogTitle>Add Material Consumption</dialog_1.DialogTitle>
                      <dialog_1.DialogDescription>
                        Select material and record consumption for this print run
                      </dialog_1.DialogDescription>
                    </dialog_1.DialogHeader>
                    <div className="space-y-4">
                      {/* Material Search */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label_1.Label>Search Materials</label_1.Label>
                          <div className="relative">
                            <lucide_react_1.Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground"/>
                            <input_1.Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or supplier..." className="pl-10"/>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label_1.Label>Filter by Type</label_1.Label>
                          <select_1.Select value={selectedType} onValueChange={setSelectedType}>
                            <select_1.SelectTrigger>
                              <select_1.SelectValue placeholder="All types"/>
                            </select_1.SelectTrigger>
                            <select_1.SelectContent>
                              <select_1.SelectItem value="">All types</select_1.SelectItem>
                              {materialTypes.map(type => (<select_1.SelectItem key={type} value={type}>{type}</select_1.SelectItem>))}
                            </select_1.SelectContent>
                          </select_1.Select>
                        </div>
                      </div>

                      {/* Material Selection */}
                      <div className="space-y-2">
                        <label_1.Label>Material</label_1.Label>
                        <select_1.Select value={newConsumption.material_id} onValueChange={(value) => setNewConsumption({ ...newConsumption, material_id: value })}>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Select material"/>
                          </select_1.SelectTrigger>
                          <select_1.SelectContent>
                            {getRelevantMaterials().map(material => (<select_1.SelectItem key={material.id} value={material.id}>
                                <div className="flex justify-between items-center w-full">
                                  <span>{material.name}</span>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <badge_1.Badge variant="outline">{material.type}</badge_1.Badge>
                                    <span>{material.available_stock} {material.unit}</span>
                                  </div>
                                </div>
                              </select_1.SelectItem>))}
                          </select_1.SelectContent>
                        </select_1.Select>
                      </div>

                      {/* Quantity and Notes */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label_1.Label>Quantity</label_1.Label>
                          <input_1.Input type="number" step="0.01" min="0" value={newConsumption.quantity} onChange={(e) => setNewConsumption({ ...newConsumption, quantity: e.target.value })} placeholder="0.00"/>
                          {newConsumption.material_id && (<p className="text-xs text-muted-foreground">
                              Available: {materials.find(m => m.id === newConsumption.material_id)?.available_stock} {materials.find(m => m.id === newConsumption.material_id)?.unit}
                            </p>)}
                        </div>
                        <div className="space-y-2">
                          <label_1.Label>Notes (optional)</label_1.Label>
                          <input_1.Input value={newConsumption.notes} onChange={(e) => setNewConsumption({ ...newConsumption, notes: e.target.value })} placeholder="Usage notes..."/>
                        </div>
                      </div>

                      {/* Cost Preview */}
                      {newConsumption.material_id && newConsumption.quantity && (<div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span>Estimated Cost:</span>
                            <span className="font-bold text-green-600">
                              ₱{(parseFloat(newConsumption.quantity || '0') * (materials.find(m => m.id === newConsumption.material_id)?.cost_per_unit || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>)}

                      <div className="flex justify-end gap-2">
                        <button_1.Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </button_1.Button>
                        <button_1.Button onClick={addMaterial} disabled={!newConsumption.material_id || !newConsumption.quantity}>
                          Add Material
                        </button_1.Button>
                      </div>
                    </div>
                  </dialog_1.DialogContent>
                </dialog_1.Dialog>)}
              
              {consumedMaterials.length > 0 && !readOnly && (<button_1.Button size="sm" variant="outline" onClick={saveMaterialConsumption} disabled={loading}>
                  <lucide_react_1.Save className="w-4 h-4 mr-2"/>
                  Save to Inventory
                </button_1.Button>)}
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          {consumedMaterials.length > 0 ? (<div className="space-y-3">
              {consumedMaterials.map((material, index) => (<div key={material.material_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{material.material_name}</span>
                      {material.batch_id && (<badge_1.Badge variant="outline" className="text-xs">
                          Batch: {material.batch_id}
                        </badge_1.Badge>)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {material.quantity} {material.unit} • ₱{material.cost.toFixed(2)}
                      {material.notes && (<span className="ml-2 italic">({material.notes})</span>)}
                    </div>
                  </div>
                  
                  {!readOnly && (<button_1.Button size="sm" variant="destructive" onClick={() => removeMaterial(material.material_id)}>
                      <lucide_react_1.Trash2 className="w-4 h-4"/>
                    </button_1.Button>)}
                </div>))}
            </div>) : (<div className="text-center py-8">
              <lucide_react_1.Package2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground"/>
              <p className="text-muted-foreground">No materials consumed yet</p>
              {!readOnly && (<button_1.Button className="mt-2" variant="outline" onClick={() => setShowAddDialog(true)}>
                  Add First Material
                </button_1.Button>)}
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Method-specific recommendations */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.AlertCircle className="w-5 h-5"/>
            Material Guidelines for {method}
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <MethodMaterialGuidelines method={method}/>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
function MethodMaterialGuidelines({ method }) {
    const guidelines = {
        SILKSCREEN: [
            '• Track ink consumption per color and design complexity',
            '• Monitor screen preparation materials (emulsion, chemicals)',
            '• Record cleaning solvents and maintenance supplies',
            '• Typical ink usage: 10-20g per print depending on coverage'
        ],
        SUBLIMATION: [
            '• Monitor sublimation paper consumption (usually 1.1-1.2x print area)',
            '• Track ink usage across all colors (CMYK)',
            '• Record transfer tape or protective paper usage',
            '• Consider paper waste for test prints and trimming'
        ],
        DTF: [
            '• Track DTF film consumption (typically 1.1x design area)',
            '• Monitor hot melt powder usage (varies by design coverage)',
            '• Record both CMYK and white ink consumption',
            '• Account for powder recycling and reuse'
        ],
        EMBROIDERY: [
            '• Track thread consumption by color and design complexity',
            '• Monitor stabilizer usage (varies by fabric and design)',
            '• Record bobbin thread consumption',
            '• Account for thread waste from changes and breaks'
        ]
    };
    const methodGuidelines = guidelines[method] || ['• No specific guidelines available'];
    return (<ul className="text-sm text-muted-foreground space-y-1">
      {methodGuidelines.map((guideline, index) => (<li key={index}>{guideline}</li>))}
    </ul>);
}
