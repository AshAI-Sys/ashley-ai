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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VersionManagementPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const react_hot_toast_1 = require("react-hot-toast");
function VersionManagementPage() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const [design, setDesign] = (0, react_1.useState)(null);
    const [versions, setVersions] = (0, react_1.useState)([]);
    const [checks, setChecks] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (params.id) {
            fetchDesignVersions(params.id);
        }
    }, [params.id]);
    const fetchDesignVersions = async (id) => {
        try {
            setLoading(true);
            // Fetch design info
            const designResponse = await fetch(`/api/designs/${id}?include=brand,order`);
            const designData = await designResponse.json();
            // Fetch versions
            const versionsResponse = await fetch(`/api/designs/${id}/versions`);
            const versionsData = await versionsResponse.json();
            // Fetch validation checks
            const checksResponse = await fetch(`/api/designs/${id}/checks`);
            const checksData = await checksResponse.json();
            if (designData.success) {
                setDesign(designData.data);
            }
            if (versionsData.success) {
                setVersions(versionsData.data);
            }
            if (checksData.success) {
                setChecks(checksData.data);
            }
        }
        catch (error) {
            console.error('Failed to fetch design versions:', error);
            react_hot_toast_1.toast.error('Failed to fetch design versions');
        }
        finally {
            setLoading(false);
        }
    };
    const getCheckResultColor = (result) => {
        switch (result.toUpperCase()) {
            case 'PASS': return 'bg-green-100 text-green-800';
            case 'WARN': return 'bg-yellow-100 text-yellow-800';
            case 'FAIL': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const runValidation = async (version) => {
        if (!design)
            return;
        const versionData = versions.find(v => v.version === version);
        if (!versionData) {
            react_hot_toast_1.toast.error('Version data not found');
            return;
        }
        try {
            const response = await fetch('/api/ashley/validate-design', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset_id: design.id,
                    version: version,
                    method: design.method,
                    files: JSON.parse(versionData.files),
                    placements: JSON.parse(versionData.placements),
                    palette: versionData.palette ? JSON.parse(versionData.palette) : []
                })
            });
            if (response.ok) {
                react_hot_toast_1.toast.success('Ashley AI validation completed');
                fetchDesignVersions(design.id); // Refresh to show new validation results
            }
            else {
                const result = await response.json();
                react_hot_toast_1.toast.error(result.message || 'Validation failed');
            }
        }
        catch (error) {
            console.error('Validation failed:', error);
            react_hot_toast_1.toast.error('Ashley AI validation failed');
        }
    };
    const setCurrentVersion = async (version) => {
        if (!design)
            return;
        if (!confirm(`Set version ${version} as the current active version?`)) {
            return;
        }
        try {
            const response = await fetch(`/api/designs/${design.id}/versions/${version}/set-current`, {
                method: 'POST'
            });
            if (response.ok) {
                react_hot_toast_1.toast.success(`Version ${version} is now the current version`);
                router.push(`/designs/${design.id}`);
            }
            else {
                const result = await response.json();
                react_hot_toast_1.toast.error(result.message || 'Failed to set current version');
            }
        }
        catch (error) {
            console.error('Failed to set current version:', error);
            react_hot_toast_1.toast.error('Failed to set current version');
        }
    };
    if (loading) {
        return (<div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>);
    }
    if (!design) {
        return (<div className="container mx-auto py-6">
        <card_1.Card>
          <card_1.CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Design not found</p>
            <link_1.default href="/designs">
              <button_1.Button className="mt-4">Back to Designs</button_1.Button>
            </link_1.default>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <link_1.default href={`/designs/${design.id}`}>
            <button_1.Button variant="ghost" size="sm">
              <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
              Back to Design
            </button_1.Button>
          </link_1.default>
          <div>
            <h1 className="text-3xl font-bold">Version Management</h1>
            <p className="text-muted-foreground">
              {design.name} • {design.order.order_number} • {design.brand.name}
            </p>
          </div>
        </div>
        
        <link_1.default href={`/designs/${design.id}/versions/new`}>
          <button_1.Button className="bg-blue-600 hover:bg-blue-700">
            <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
            Create New Version
          </button_1.Button>
        </link_1.default>
      </div>

      {/* Version History */}
      <div className="space-y-6">
        {versions.length > 0 ? (versions
            .sort((a, b) => b.version - a.version)
            .map(version => {
            const files = JSON.parse(version.files);
            const placements = JSON.parse(version.placements);
            const palette = version.palette ? JSON.parse(version.palette) : [];
            const meta = version.meta ? JSON.parse(version.meta) : {};
            // Find validation checks for this version
            const versionChecks = checks.filter(check => check.version === version.version);
            const latestCheck = versionChecks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            return (<card_1.Card key={version.id} className="overflow-hidden">
                  <card_1.CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">Version {version.version}</h3>
                        {version.version === design.current_version && (<badge_1.Badge className="bg-blue-100 text-blue-800">Current</badge_1.Badge>)}
                        {latestCheck && (<badge_1.Badge className={getCheckResultColor(latestCheck.result)}>
                            AI: {latestCheck.result}
                          </badge_1.Badge>)}
                      </div>
                      <div className="flex items-center gap-2">
                        {version.version !== design.current_version && (<button_1.Button size="sm" variant="outline" onClick={() => setCurrentVersion(version.version)}>
                            Set as Current
                          </button_1.Button>)}
                        <button_1.Button size="sm" variant="outline" onClick={() => runValidation(version.version)}>
                          <lucide_react_1.Zap className="w-4 h-4 mr-1"/>
                          Validate
                        </button_1.Button>
                        <link_1.default href={`/designs/${design.id}/versions/${version.version}`}>
                          <button_1.Button size="sm" variant="outline">
                            <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                            View Details
                          </button_1.Button>
                        </link_1.default>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Created: {new Date(version.created_at).toLocaleString()}
                    </p>
                  </card_1.CardHeader>
                  
                  <card_1.CardContent className="space-y-4">
                    {/* Files Overview */}
                    <div>
                      <h4 className="font-medium mb-2">Files</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {files.mockup_url && (<div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                            <lucide_react_1.Image className="w-4 h-4 text-blue-600"/>
                            <span>Mockup</span>
                          </div>)}
                        {files.prod_url && (<div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                            <lucide_react_1.FileText className="w-4 h-4 text-green-600"/>
                            <span>Production</span>
                          </div>)}
                        {files.separations && files.separations.length > 0 && (<div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                            <lucide_react_1.FileText className="w-4 h-4 text-purple-600"/>
                            <span>{files.separations.length} Separations</span>
                          </div>)}
                        {files.dst_url && (<div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                            <lucide_react_1.FileText className="w-4 h-4 text-pink-600"/>
                            <span>Embroidery</span>
                          </div>)}
                      </div>
                    </div>

                    {/* Placements Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Placements</h4>
                      <div className="flex flex-wrap gap-2">
                        {placements.map((placement, index) => (<badge_1.Badge key={index} variant="outline" className="text-xs">
                            {placement.area?.replace('_', ' ') || 'Unknown'}: {placement.width_cm}×{placement.height_cm}cm
                          </badge_1.Badge>))}
                      </div>
                    </div>

                    {/* Color Palette */}
                    {palette.length > 0 && (<div>
                        <h4 className="font-medium mb-2">Colors ({palette.length})</h4>
                        <div className="flex gap-1">
                          {palette.slice(0, 8).map((color, index) => (<div key={index} className="w-6 h-6 border border-gray-300 rounded" style={{ backgroundColor: color }} title={color}/>))}
                          {palette.length > 8 && (<div className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-xs bg-gray-100">
                              +{palette.length - 8}
                            </div>)}
                        </div>
                      </div>)}

                    {/* Latest Validation Results */}
                    {latestCheck && (<div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Latest Validation</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <badge_1.Badge className={getCheckResultColor(latestCheck.result)}>
                              {latestCheck.result}
                            </badge_1.Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(latestCheck.created_at).toLocaleString()}
                            </span>
                          </div>
                          {JSON.parse(latestCheck.issues || '[]').length > 0 && (<span className="text-sm text-amber-600">
                              {JSON.parse(latestCheck.issues).length} issues found
                            </span>)}
                        </div>
                      </div>)}

                    {/* Version Notes */}
                    {meta.notes && (<div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">{meta.notes}</p>
                      </div>)}
                  </card_1.CardContent>
                </card_1.Card>);
        })) : (<card_1.Card>
            <card_1.CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No versions found</p>
              <link_1.default href={`/designs/${design.id}/versions/new`}>
                <button_1.Button>Create First Version</button_1.Button>
              </link_1.default>
            </card_1.CardContent>
          </card_1.Card>)}
      </div>

      {/* Summary Statistics */}
      {versions.length > 0 && (<card_1.Card className="mt-6">
          <card_1.CardHeader>
            <card_1.CardTitle>Version Statistics</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{versions.length}</div>
                <div className="text-sm text-muted-foreground">Total Versions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{design.current_version}</div>
                <div className="text-sm text-muted-foreground">Current Version</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{checks.length}</div>
                <div className="text-sm text-muted-foreground">AI Validations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {checks.filter(check => check.result === 'PASS').length}
                </div>
                <div className="text-sm text-muted-foreground">Passed Validations</div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
