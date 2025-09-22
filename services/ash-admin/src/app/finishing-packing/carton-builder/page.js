'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CartonBuilderPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const separator_1 = require("@/components/ui/separator");
function CartonBuilderPage() {
    const router = (0, navigation_1.useRouter)();
    const [cartonState, setCartonState] = (0, react_1.useState)({
        order_id: '',
        dimensions: { length: 40, width: 30, height: 25 },
        tare_weight: 0.5,
        contents: [],
        metrics: {
            actual_weight: 0.5,
            dimensional_weight: 0,
            fill_percentage: 0,
            unit_count: 0
        }
    });
    const [availableUnits, setAvailableUnits] = (0, react_1.useState)([]);
    const [optimization, setOptimization] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [ashleyMode, setAshleyMode] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        loadAvailableUnits();
        calculateMetrics();
    }, []);
    (0, react_1.useEffect)(() => {
        calculateMetrics();
        if (ashleyMode) {
            getAshleyOptimization();
        }
    }, [cartonState.contents, cartonState.dimensions]);
    const loadAvailableUnits = async () => {
        try {
            const response = await fetch('/api/packing/available-units?status=FINISHED');
            const data = await response.json();
            setAvailableUnits(data.units || []);
        }
        catch (error) {
            console.error('Error loading available units:', error);
            // Mock data for demo
            setAvailableUnits([
                {
                    id: '1',
                    sku: 'TEE-BLK-M',
                    size_code: 'M',
                    color: 'Black',
                    unit_serial: 'BDL-001-001',
                    order_number: 'ORD-2024-001',
                    estimated_weight: 0.15,
                    estimated_volume: 300
                },
                {
                    id: '2',
                    sku: 'TEE-BLK-L',
                    size_code: 'L',
                    color: 'Black',
                    unit_serial: 'BDL-001-002',
                    order_number: 'ORD-2024-001',
                    estimated_weight: 0.18,
                    estimated_volume: 350
                },
                {
                    id: '3',
                    sku: 'TEE-WHT-M',
                    size_code: 'M',
                    color: 'White',
                    unit_serial: 'BDL-002-001',
                    order_number: 'ORD-2024-002',
                    estimated_weight: 0.15,
                    estimated_volume: 300
                }
            ]);
        }
    };
    const calculateMetrics = () => {
        const unitCount = cartonState.contents.reduce((sum, content) => sum + content.quantity, 0);
        const contentWeight = cartonState.contents.reduce((sum, content) => sum + (content.quantity * content.unit.estimated_weight), 0);
        const actualWeight = cartonState.tare_weight + contentWeight;
        const cartonVolume = cartonState.dimensions.length *
            cartonState.dimensions.width *
            cartonState.dimensions.height;
        const usedVolume = cartonState.contents.reduce((sum, content) => sum + (content.quantity * content.unit.estimated_volume), 0);
        const fillPercentage = cartonVolume > 0 ? (usedVolume / cartonVolume) * 100 : 0;
        // Calculate dimensional weight (carrier-specific divisor)
        const dimensionalWeight = cartonVolume / 5000; // 5000 is common divisor
        setCartonState(prev => ({
            ...prev,
            metrics: {
                actual_weight: actualWeight,
                dimensional_weight: dimensionalWeight,
                fill_percentage: Math.min(100, fillPercentage),
                unit_count: unitCount
            }
        }));
    };
    const getAshleyOptimization = async () => {
        try {
            const response = await fetch('/api/packing/ashley-optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: cartonState.contents,
                    current_dimensions: cartonState.dimensions
                })
            });
            const data = await response.json();
            setOptimization(data);
        }
        catch (error) {
            console.error('Error getting Ashley optimization:', error);
            // Mock optimization for demo
            setOptimization({
                recommended_dimensions: {
                    length: Math.ceil(cartonState.dimensions.length * 0.95),
                    width: Math.ceil(cartonState.dimensions.width * 1.05),
                    height: Math.ceil(cartonState.dimensions.height * 0.9)
                },
                max_units: 45,
                fill_efficiency: 92.5,
                weight_distribution: 'OPTIMAL',
                cost_analysis: {
                    shipping_cost: 125.50,
                    material_cost: 12.75,
                    total_cost: 138.25
                }
            });
        }
    };
    const addUnitToCarton = (unit, quantity = 1) => {
        setCartonState(prev => {
            const existingContent = prev.contents.find(c => c.finished_unit_id === unit.id);
            if (existingContent) {
                return {
                    ...prev,
                    contents: prev.contents.map(c => c.finished_unit_id === unit.id
                        ? { ...c, quantity: c.quantity + quantity }
                        : c)
                };
            }
            else {
                return {
                    ...prev,
                    contents: [...prev.contents, {
                            finished_unit_id: unit.id,
                            quantity,
                            unit
                        }]
                };
            }
        });
    };
    const removeUnitFromCarton = (unitId, quantity = 1) => {
        setCartonState(prev => ({
            ...prev,
            contents: prev.contents.reduce((acc, content) => {
                if (content.finished_unit_id === unitId) {
                    const newQuantity = content.quantity - quantity;
                    if (newQuantity > 0) {
                        acc.push({ ...content, quantity: newQuantity });
                    }
                }
                else {
                    acc.push(content);
                }
                return acc;
            }, [])
        }));
    };
    const applyAshleyOptimization = () => {
        if (!optimization)
            return;
        setCartonState(prev => ({
            ...prev,
            dimensions: optimization.recommended_dimensions
        }));
    };
    const saveCarton = async () => {
        setLoading(true);
        try {
            const cartonData = {
                order_id: cartonState.order_id,
                length_cm: cartonState.dimensions.length,
                width_cm: cartonState.dimensions.width,
                height_cm: cartonState.dimensions.height,
                tare_weight_kg: cartonState.tare_weight,
                contents: cartonState.contents
            };
            const response = await fetch('/api/packing/cartons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cartonData)
            });
            if (response.ok) {
                router.push('/finishing-packing');
            }
        }
        catch (error) {
            console.error('Error saving carton:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const getEfficiencyColor = (percentage) => {
        if (percentage >= 85)
            return 'text-green-600';
        if (percentage >= 70)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    return (<div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button_1.Button variant="ghost" onClick={() => router.back()} className="flex items-center">
              <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
              Back
            </button_1.Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Carton Builder</h1>
              <p className="text-sm text-gray-500">AI-powered packing optimization</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button_1.Button variant={ashleyMode ? "default" : "outline"} onClick={() => setAshleyMode(!ashleyMode)} className="flex items-center">
              <lucide_react_1.Zap className="w-4 h-4 mr-2"/>
              Ashley AI {ashleyMode ? 'ON' : 'OFF'}
            </button_1.Button>
            <button_1.Button onClick={saveCarton} disabled={loading || cartonState.contents.length === 0}>
              <lucide_react_1.Save className="w-4 h-4 mr-2"/>
              {loading ? 'Saving...' : 'Save Carton'}
            </button_1.Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Available Units */}
          <div className="lg:col-span-1">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center">
                  <lucide_react_1.Package className="w-5 h-5 mr-2"/>
                  Available Units
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableUnits.map((unit) => (<div key={unit.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{unit.sku}</div>
                          <div className="text-xs text-gray-500">
                            {unit.size_code} • {unit.color}
                          </div>
                          <div className="text-xs text-gray-500">
                            {unit.order_number}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button_1.Button size="sm" variant="outline" onClick={() => addUnitToCarton(unit)} className="h-6 w-6 p-0">
                            <lucide_react_1.Plus className="w-3 h-3"/>
                          </button_1.Button>
                        </div>
                      </div>
                    </div>))}
                </div>

                {availableUnits.length === 0 && (<div className="text-center py-8 text-gray-500">
                    <lucide_react_1.Package className="w-8 h-8 mx-auto mb-2"/>
                    <p className="text-sm">No units available for packing</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Right Column - Carton Builder */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Carton Configuration */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <lucide_react_1.Box className="w-5 h-5 mr-2"/>
                      Carton Configuration
                    </span>
                    {optimization && ashleyMode && (<button_1.Button size="sm" onClick={applyAshleyOptimization} className="flex items-center">
                        <lucide_react_1.Zap className="w-4 h-4 mr-1"/>
                        Apply AI Optimization
                      </button_1.Button>)}
                  </card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label_1.Label htmlFor="length">Length (cm)</label_1.Label>
                      <input_1.Input id="length" type="number" value={cartonState.dimensions.length} onChange={(e) => setCartonState(prev => ({
            ...prev,
            dimensions: { ...prev.dimensions, length: parseInt(e.target.value) || 0 }
        }))}/>
                    </div>
                    <div>
                      <label_1.Label htmlFor="width">Width (cm)</label_1.Label>
                      <input_1.Input id="width" type="number" value={cartonState.dimensions.width} onChange={(e) => setCartonState(prev => ({
            ...prev,
            dimensions: { ...prev.dimensions, width: parseInt(e.target.value) || 0 }
        }))}/>
                    </div>
                    <div>
                      <label_1.Label htmlFor="height">Height (cm)</label_1.Label>
                      <input_1.Input id="height" type="number" value={cartonState.dimensions.height} onChange={(e) => setCartonState(prev => ({
            ...prev,
            dimensions: { ...prev.dimensions, height: parseInt(e.target.value) || 0 }
        }))}/>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-600">Volume</div>
                      <div className="text-lg font-bold">
                        {(cartonState.dimensions.length *
            cartonState.dimensions.width *
            cartonState.dimensions.height / 1000).toFixed(1)}L
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-600">Weight</div>
                      <div className="text-lg font-bold">
                        {cartonState.metrics.actual_weight.toFixed(2)}kg
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-600">Fill</div>
                      <div className={`text-lg font-bold ${getEfficiencyColor(cartonState.metrics.fill_percentage)}`}>
                        {cartonState.metrics.fill_percentage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-600">Units</div>
                      <div className="text-lg font-bold">
                        {cartonState.metrics.unit_count}
                      </div>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Carton Contents */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Carton Contents</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {cartonState.contents.length > 0 ? (<div className="space-y-3">
                      {cartonState.contents.map((content, index) => (<div key={index} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <div className="font-medium">{content.unit.sku}</div>
                            <div className="text-sm text-gray-500">
                              {content.unit.size_code} • {content.unit.color}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Qty: {content.quantity}</span>
                            <button_1.Button size="sm" variant="outline" onClick={() => addUnitToCarton(content.unit)} className="h-6 w-6 p-0">
                              <lucide_react_1.Plus className="w-3 h-3"/>
                            </button_1.Button>
                            <button_1.Button size="sm" variant="outline" onClick={() => removeUnitFromCarton(content.finished_unit_id)} className="h-6 w-6 p-0">
                              <lucide_react_1.Minus className="w-3 h-3"/>
                            </button_1.Button>
                          </div>
                        </div>))}
                    </div>) : (<div className="text-center py-8 text-gray-500">
                      <lucide_react_1.Box className="w-12 h-12 mx-auto mb-4 text-gray-400"/>
                      <p>No units added to carton</p>
                      <p className="text-sm">Add units from the available list</p>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>

              {/* Ashley AI Optimization */}
              {ashleyMode && optimization && (<card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">AI</span>
                      </div>
                      Ashley AI Packing Optimization
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Recommended Dimensions</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Length: {optimization.recommended_dimensions.length} cm</div>
                            <div>Width: {optimization.recommended_dimensions.width} cm</div>
                            <div>Height: {optimization.recommended_dimensions.height} cm</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Efficiency Analysis</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Max Units: {optimization.max_units}</div>
                            <div>Fill Efficiency: {optimization.fill_efficiency}%</div>
                            <div>Distribution: {optimization.weight_distribution}</div>
                          </div>
                        </div>
                      </div>

                      <separator_1.Separator />

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Cost Analysis</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="text-blue-600 font-medium">Shipping Cost</div>
                            <div className="text-lg font-bold text-blue-900">
                              ₱{optimization.cost_analysis.shipping_cost.toFixed(2)}
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded">
                            <div className="text-green-600 font-medium">Material Cost</div>
                            <div className="text-lg font-bold text-green-900">
                              ₱{optimization.cost_analysis.material_cost.toFixed(2)}
                            </div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded">
                            <div className="text-purple-600 font-medium">Total Cost</div>
                            <div className="text-lg font-bold text-purple-900">
                              ₱{optimization.cost_analysis.total_cost.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>)}
            </div>
          </div>
        </div>
      </div>
    </div>);
}
