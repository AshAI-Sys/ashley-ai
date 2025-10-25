"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NewInspectionPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const textarea_1 = require("@/components/ui/textarea");
const select_1 = require("@/components/ui/select");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const FileUpload_1 = require("@/components/FileUpload");
function NewInspectionPage() {
    const router = (0, navigation_1.useRouter)();
    const [formData, setFormData] = (0, react_1.useState)({
        order_id: "",
        bundle_id: "",
        inspection_type: "FINAL",
        lot_size: 0,
        aql_major: 2.5,
        aql_minor: 4.0,
        inspector_id: "",
        notes: "",
    });
    const [samples, setSamples] = (0, react_1.useState)([]);
    const [defectCodes, setDefectCodes] = (0, react_1.useState)([]);
    const [currentSample, setCurrentSample] = (0, react_1.useState)(null);
    const [inspectionResult, setInspectionResult] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [newDefect, setNewDefect] = (0, react_1.useState)({
        defect_code_id: "",
        severity: "MINOR",
        quantity: 1,
        location: "",
        description: "",
        photo_url: "",
    });
    (0, react_1.useEffect)(() => {
        loadDefectCodes();
        loadOrders();
    }, []);
    (0, react_1.useEffect)(() => {
        if (formData.lot_size > 0) {
            calculateSampling();
        }
    }, [formData.lot_size, formData.aql_major]);
    const loadDefectCodes = async () => {
        try {
            const response = await fetch("/api/quality-control/defect-codes");
            const data = await response.json();
            setDefectCodes(data);
        }
        catch (error) {
            console.error("Error loading defect codes:", error);
        }
    };
    const loadOrders = async () => {
        // In production, load available orders for inspection
    };
    const calculateSampling = () => {
        // AQL sampling calculation - simplified version
        const lotSize = formData.lot_size;
        let sampleSize = 8;
        let acceptance = 1;
        let rejection = 2;
        if (lotSize <= 50) {
            sampleSize = 5;
            acceptance = 0;
            rejection = 1;
        }
        else if (lotSize <= 90) {
            sampleSize = 8;
            acceptance = 0;
            rejection = 1;
        }
        else if (lotSize <= 150) {
            sampleSize = 13;
            acceptance = 1;
            rejection = 2;
        }
        else if (lotSize <= 280) {
            sampleSize = 20;
            acceptance = 1;
            rejection = 2;
        }
        else if (lotSize <= 500) {
            sampleSize = 32;
            acceptance = 2;
            rejection = 3;
        }
        else if (lotSize <= 1200) {
            sampleSize = 50;
            acceptance = 3;
            rejection = 4;
        }
        else {
            sampleSize = 80;
            acceptance = 5;
            rejection = 6;
        }
        setInspectionResult({
            sampleSize,
            acceptance,
            rejection,
            result: "PENDING_REVIEW",
        });
        // Initialize samples
        const newSamples = [];
        for (let i = 1; i <= sampleSize; i++) {
            newSamples.push({
                sample_no: i,
                qty_sampled: 1,
                pass_fail: true,
                defects: [],
            });
        }
        setSamples(newSamples);
    };
    const _addDefectToSample = (sampleIndex, defect) => {
        const updatedSamples = [...samples];
        updatedSamples[sampleIndex].defects.push(defect);
        updatedSamples[sampleIndex].pass_fail = false;
        setSamples(updatedSamples);
        evaluateInspectionResult(updatedSamples);
    };
    const evaluateInspectionResult = (samplesData) => {
        if (!inspectionResult)
            return;
        const totalDefects = samplesData.reduce((sum, sample) => sum +
            sample.defects.reduce((defectSum, defect) => defectSum + defect.quantity, 0), 0);
        let result = "PENDING_REVIEW";
        if (totalDefects <= inspectionResult.acceptance) {
            result = "ACCEPT";
        }
        else if (totalDefects >= inspectionResult.rejection) {
            result = "REJECT";
        }
        setInspectionResult({
            ...inspectionResult,
            result,
        });
    };
    const addDefect = () => {
        if (!currentSample || !newDefect.defect_code_id)
            return;
        // Add defect to current sample
        const updatedSample = {
            ...currentSample,
            defects: [...currentSample.defects, newDefect],
            pass_fail: false, // Sample fails if it has defects
        };
        // Update samples list
        const updatedSamples = samples.map(s => s.sample_no === currentSample.sample_no ? updatedSample : s);
        setSamples(updatedSamples);
        // Reset form and close modal
        setNewDefect({
            defect_code_id: "",
            severity: "MINOR",
            quantity: 1,
            location: "",
            description: "",
            photo_url: "",
        });
        setCurrentSample(null);
    };
    const saveInspection = async () => {
        setLoading(true);
        try {
            const inspectionData = {
                ...formData,
                samples,
                ...inspectionResult,
            };
            const response = await fetch("/api/quality-control/inspections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(inspectionData),
            });
            if (response.ok) {
                router.push("/quality-control");
            }
        }
        catch (error) {
            console.error("Error saving inspection:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const getResultBadge = (result) => {
        switch (result) {
            case "ACCEPT":
                return <badge_1.Badge className="bg-green-100 text-green-800">PASS</badge_1.Badge>;
            case "REJECT":
                return <badge_1.Badge className="bg-red-100 text-red-800">FAIL</badge_1.Badge>;
            default:
                return <badge_1.Badge className="bg-yellow-100 text-yellow-800">PENDING</badge_1.Badge>;
        }
    };
    return (<div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button_1.Button variant="ghost" onClick={() => router.back()} className="flex items-center">
              <lucide_react_1.ArrowLeft className="mr-2 h-4 w-4"/>
              Back
            </button_1.Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                New Quality Inspection
              </h1>
              <p className="text-sm text-gray-500">
                AQL-based statistical sampling inspection
              </p>
            </div>
          </div>

          {inspectionResult && (<div className="flex items-center space-x-4">
              {getResultBadge(inspectionResult.result)}
              <button_1.Button onClick={saveInspection} disabled={loading}>
                <lucide_react_1.Save className="mr-2 h-4 w-4"/>
                {loading ? "Saving..." : "Complete Inspection"}
              </button_1.Button>
            </div>)}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Inspection Setup */}
          <div className="lg:col-span-1">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Inspection Details</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div>
                  <label_1.Label htmlFor="order_id">Order</label_1.Label>
                  <input_1.Input id="order_id" placeholder="ORD-2024-001" value={formData.order_id} onChange={e => setFormData({ ...formData, order_id: e.target.value })}/>
                </div>

                <div>
                  <label_1.Label htmlFor="inspection_type">Inspection Type</label_1.Label>
                  <select_1.Select value={formData.inspection_type} onValueChange={value => setFormData({ ...formData, inspection_type: value })}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="INLINE_PRINTING">
                        Inline Printing
                      </select_1.SelectItem>
                      <select_1.SelectItem value="INLINE_SEWING">
                        Inline Sewing
                      </select_1.SelectItem>
                      <select_1.SelectItem value="FINAL">Final QC</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div>
                  <label_1.Label htmlFor="lot_size">Lot Size (pcs)</label_1.Label>
                  <input_1.Input id="lot_size" type="number" value={formData.lot_size || ""} onChange={e => setFormData({
            ...formData,
            lot_size: parseInt(e.target.value) || 0,
        })}/>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label_1.Label htmlFor="aql_major">AQL Major</label_1.Label>
                    <input_1.Input id="aql_major" type="number" step="0.1" value={formData.aql_major} onChange={e => setFormData({
            ...formData,
            aql_major: parseFloat(e.target.value),
        })}/>
                  </div>
                  <div>
                    <label_1.Label htmlFor="aql_minor">AQL Minor</label_1.Label>
                    <input_1.Input id="aql_minor" type="number" step="0.1" value={formData.aql_minor} onChange={e => setFormData({
            ...formData,
            aql_minor: parseFloat(e.target.value),
        })}/>
                  </div>
                </div>

                {inspectionResult && (<div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-medium text-blue-900">
                      Sampling Plan
                    </h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div>
                        Sample Size:{" "}
                        <strong>{inspectionResult.sample_size}</strong>
                      </div>
                      <div>
                        Acceptance:{" "}
                        <strong>{inspectionResult.acceptance}</strong>
                      </div>
                      <div>
                        Rejection: <strong>{inspectionResult.rejection}</strong>
                      </div>
                    </div>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Right Column - Sampling & Defects */}
          <div className="lg:col-span-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Sample Inspection</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                {samples.length > 0 ? (<div className="space-y-4">
                    {samples.map((sample, index) => (<div key={sample.sample_no} className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="font-medium">
                            Sample #{sample.sample_no}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {sample.pass_fail ? (<lucide_react_1.CheckCircle className="h-5 w-5 text-green-500"/>) : (<lucide_react_1.XCircle className="h-5 w-5 text-red-500"/>)}
                            <button_1.Button size="sm" variant="outline" onClick={() => setCurrentSample(sample)}>
                              Add Defect
                            </button_1.Button>
                          </div>
                        </div>

                        {sample.defects.length > 0 && (<div className="space-y-2">
                            {sample.defects.map((defect, defectIndex) => (<div key={defectIndex} className="flex items-center justify-between rounded bg-red-50 p-2">
                                <div className="text-sm">
                                  <span className="font-medium">
                                    {defect.severity}
                                  </span>
                                  <span className="ml-2 text-gray-600">
                                    Qty: {defect.quantity}
                                  </span>
                                  {defect.location && (<span className="ml-2 text-gray-600">
                                      @ {defect.location}
                                    </span>)}
                                </div>
                              </div>))}
                          </div>)}
                      </div>))}
                  </div>) : (<div className="py-8 text-center text-gray-500">
                    <lucide_react_1.AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-500"/>
                    <p>Enter lot size to generate sampling plan</p>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </div>
      </div>

      {/* Defect Entry Modal would go here */}
      {currentSample && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <card_1.Card className="w-full max-w-md">
            <card_1.CardHeader>
              <card_1.CardTitle>
                Add Defect - Sample #{currentSample.sample_no}
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <p className="mb-4 text-sm text-gray-500">
                Select defect type and provide details
              </p>
              <div className="space-y-4">
                <div>
                  <label_1.Label htmlFor="defect_code">Defect Code</label_1.Label>
                  <select_1.Select value={newDefect.defect_code_id} onValueChange={value => setNewDefect({ ...newDefect, defect_code_id: value })}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Select defect"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {defectCodes.map(code => (<select_1.SelectItem key={code.id} value={code.id}>
                          {code.code} - {code.name} ({code.severity})
                        </select_1.SelectItem>))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="severity">Severity</label_1.Label>
                    <select_1.Select value={newDefect.severity} onValueChange={value => setNewDefect({ ...newDefect, severity: value })}>
                      <select_1.SelectTrigger>
                        <select_1.SelectValue />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="CRITICAL">Critical</select_1.SelectItem>
                        <select_1.SelectItem value="MAJOR">Major</select_1.SelectItem>
                        <select_1.SelectItem value="MINOR">Minor</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>

                  <div>
                    <label_1.Label htmlFor="quantity">Quantity</label_1.Label>
                    <input_1.Input id="quantity" type="number" min="1" value={newDefect.quantity} onChange={e => setNewDefect({
                ...newDefect,
                quantity: parseInt(e.target.value) || 1,
            })}/>
                  </div>
                </div>

                <div>
                  <label_1.Label htmlFor="location">Location</label_1.Label>
                  <input_1.Input id="location" placeholder="e.g., Left sleeve, Front panel" value={newDefect.location} onChange={e => setNewDefect({ ...newDefect, location: e.target.value })}/>
                </div>

                <div>
                  <label_1.Label htmlFor="description">Description</label_1.Label>
                  <textarea_1.Textarea id="description" placeholder="Describe the defect..." value={newDefect.description} onChange={e => setNewDefect({
                ...newDefect,
                description: e.target.value,
            })} rows={3}/>
                </div>

                <div>
                  <label_1.Label>Defect Photo (Optional)</label_1.Label>
                  <FileUpload_1.FileUpload onUpload={url => setNewDefect({ ...newDefect, photo_url: url })} accept="image/*" maxSizeMB={5} folder="qc-defects" type="image" existingUrls={newDefect.photo_url ? [newDefect.photo_url] : []} onRemove={() => setNewDefect({ ...newDefect, photo_url: "" })}/>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button_1.Button variant="outline" onClick={() => setCurrentSample(null)}>
                  Cancel
                </button_1.Button>
                <button_1.Button onClick={addDefect} disabled={!newDefect.defect_code_id}>
                  Add Defect
                </button_1.Button>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>)}
    </div>);
}
