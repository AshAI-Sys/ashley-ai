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
exports.default = DesignDetailsPage;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const separator_1 = require("@/components/ui/separator");
const textarea_1 = require("@/components/ui/textarea");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const react_hot_toast_1 = require("react-hot-toast");
function DesignDetailsPage() {
    const params = (0, navigation_1.useParams)();
    const router = (0, navigation_1.useRouter)();
    const [design, setDesign] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [activeTab, setActiveTab] = (0, react_1.useState)('overview');
    const [newComment, setNewComment] = (0, react_1.useState)('');
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (params.id) {
            fetchDesign(params.id);
        }
    }, [params.id]);
    const fetchDesign = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/designs/${id}?include=order,brand,versions,approvals,checks`);
            const data = await response.json();
            if (data.success) {
                setDesign(data.data);
            }
            else {
                react_hot_toast_1.toast.error('Failed to fetch design details');
                router.push('/designs');
            }
        }
        catch (error) {
            console.error('Failed to fetch design:', error);
            react_hot_toast_1.toast.error('Failed to fetch design details');
            router.push('/designs');
        }
        finally {
            setLoading(false);
        }
    };
    const getStatusColor = (status) => {
        if (!status)
            return 'bg-gray-100 text-gray-800';
        switch (status.toUpperCase()) {
            case 'DRAFT': return 'bg-gray-100 text-gray-800';
            case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'LOCKED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getMethodColor = (method) => {
        if (!method)
            return 'bg-gray-100 text-gray-800';
        switch (method.toUpperCase()) {
            case 'SILKSCREEN': return 'bg-purple-100 text-purple-800';
            case 'SUBLIMATION': return 'bg-cyan-100 text-cyan-800';
            case 'DTF': return 'bg-orange-100 text-orange-800';
            case 'EMBROIDERY': return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getCheckResultColor = (result) => {
        if (!result)
            return 'bg-gray-100 text-gray-800';
        switch (result.toUpperCase()) {
            case 'PASS': return 'bg-green-100 text-green-800';
            case 'WARN': return 'bg-yellow-100 text-yellow-800';
            case 'FAIL': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const handleSendApproval = async (version) => {
        if (!design)
            return;
        const targetVersion = version || design.current_version;
        try {
            setSubmitting(true);
            const response = await fetch(`/api/designs/${design.id}/approvals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    version: targetVersion,
                    comments: newComment
                })
            });
            if (response.ok) {
                react_hot_toast_1.toast.success('Design sent for client approval');
                setNewComment('');
                fetchDesign(design.id);
            }
            else {
                const result = await response.json();
                react_hot_toast_1.toast.error(result.message || 'Failed to send approval');
            }
        }
        catch (error) {
            console.error('Failed to send approval:', error);
            react_hot_toast_1.toast.error('Failed to send approval');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleLockDesign = async (version) => {
        if (!design)
            return;
        const targetVersion = version || design.current_version;
        if (!confirm(`Are you sure you want to lock version ${targetVersion}? This cannot be undone.`)) {
            return;
        }
        try {
            const response = await fetch(`/api/designs/${design.id}/versions/${targetVersion}/lock`, {
                method: 'POST'
            });
            if (response.ok) {
                react_hot_toast_1.toast.success('Design version locked successfully');
                fetchDesign(design.id);
            }
            else {
                const result = await response.json();
                react_hot_toast_1.toast.error(result.message || 'Failed to lock design');
            }
        }
        catch (error) {
            console.error('Failed to lock design:', error);
            react_hot_toast_1.toast.error('Failed to lock design');
        }
    };
    const runAshleyValidation = async (version) => {
        if (!design)
            return;
        const targetVersion = version || design.current_version;
        const versionData = design.versions.find(v => v.version === targetVersion);
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
                    version: targetVersion,
                    method: design.method,
                    files: JSON.parse(versionData.files),
                    placements: JSON.parse(versionData.placements),
                    palette: versionData.palette ? JSON.parse(versionData.palette) : []
                })
            });
            if (response.ok) {
                react_hot_toast_1.toast.success('Ashley AI validation completed');
                fetchDesign(design.id); // Refresh to show new validation results
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
    const currentVersion = design.versions.find(v => v.version === design.current_version);
    const files = currentVersion ? JSON.parse(currentVersion.files) : {};
    const placements = currentVersion ? JSON.parse(currentVersion.placements) : [];
    const palette = currentVersion && currentVersion.palette ? JSON.parse(currentVersion.palette) : [];
    return (<div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <link_1.default href="/designs">
            <button_1.Button variant="ghost" size="sm">
              <lucide_react_1.ArrowLeft className="w-4 h-4 mr-2"/>
              Back to Designs
            </button_1.Button>
          </link_1.default>
          <div>
            <h1 className="text-3xl font-bold">{design.name}</h1>
            <p className="text-muted-foreground">
              {design.order.order_number} • {design.brand.name} • Version {design.current_version}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <badge_1.Badge className={getStatusColor(design.status)}>
            {design.status.replace('_', ' ')}
          </badge_1.Badge>
          <badge_1.Badge className={getMethodColor(design.method)}>
            {design.method}
          </badge_1.Badge>
          {design.is_best_seller && (<badge_1.Badge variant="secondary">⭐ Best Seller</badge_1.Badge>)}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        {[
            { id: 'overview', label: 'Overview', icon: lucide_react_1.Eye },
            { id: 'versions', label: 'Versions', icon: lucide_react_1.Upload },
            { id: 'approvals', label: 'Approvals', icon: lucide_react_1.CheckCircle },
            { id: 'validation', label: 'AI Checks', icon: lucide_react_1.Zap }
        ].map(tab => {
            const Icon = tab.icon;
            return (<button key={tab.id} className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-gray-900'}`} onClick={() => setActiveTab(tab.id)}>
              <Icon className="w-4 h-4"/>
              {tab.label}
            </button>);
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (<>
              {/* Current Version Files */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Design Files (Version {design.current_version})</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  {files.mockup_url && (<div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <lucide_react_1.Image className="w-5 h-5 text-blue-600"/>
                        <span>Mockup File</span>
                      </div>
                      <div className="flex gap-2">
                        <button_1.Button size="sm" variant="outline" asChild>
                          <a href={files.mockup_url} target="_blank" rel="noopener noreferrer">
                            <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                            View
                          </a>
                        </button_1.Button>
                        <button_1.Button size="sm" variant="outline" asChild>
                          <a href={files.mockup_url} download>
                            <lucide_react_1.Download className="w-4 h-4 mr-1"/>
                            Download
                          </a>
                        </button_1.Button>
                      </div>
                    </div>)}
                  
                  {files.prod_url && (<div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <lucide_react_1.FileText className="w-5 h-5 text-green-600"/>
                        <span>Production File</span>
                      </div>
                      <div className="flex gap-2">
                        <button_1.Button size="sm" variant="outline" asChild>
                          <a href={files.prod_url} target="_blank" rel="noopener noreferrer">
                            <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                            View
                          </a>
                        </button_1.Button>
                        <button_1.Button size="sm" variant="outline" asChild>
                          <a href={files.prod_url} download>
                            <lucide_react_1.Download className="w-4 h-4 mr-1"/>
                            Download
                          </a>
                        </button_1.Button>
                      </div>
                    </div>)}
                  
                  {files.separations && files.separations.length > 0 && (<div>
                      <h4 className="font-medium mb-2">Color Separations</h4>
                      {files.separations.map((url, index) => (<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
                          <div className="flex items-center gap-2">
                            <lucide_react_1.FileText className="w-5 h-5 text-purple-600"/>
                            <span>Separation {index + 1}</span>
                          </div>
                          <div className="flex gap-2">
                            <button_1.Button size="sm" variant="outline" asChild>
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                                View
                              </a>
                            </button_1.Button>
                            <button_1.Button size="sm" variant="outline" asChild>
                              <a href={url} download>
                                <lucide_react_1.Download className="w-4 h-4 mr-1"/>
                                Download
                              </a>
                            </button_1.Button>
                          </div>
                        </div>))}
                    </div>)}
                  
                  {files.dst_url && (<div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <lucide_react_1.FileText className="w-5 h-5 text-pink-600"/>
                        <span>Embroidery File</span>
                      </div>
                      <div className="flex gap-2">
                        <button_1.Button size="sm" variant="outline" asChild>
                          <a href={files.dst_url} download>
                            <lucide_react_1.Download className="w-4 h-4 mr-1"/>
                            Download
                          </a>
                        </button_1.Button>
                      </div>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>

              {/* Placements */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle>Design Placements</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    {placements.map((placement, index) => (<div key={index} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">{placement.area?.replace('_', ' ') || 'Unknown Area'}</h4>
                          <span className="text-sm text-muted-foreground">
                            {placement.width_cm} × {placement.height_cm} cm
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Offset: X {placement.offset_x}cm, Y {placement.offset_y}cm
                        </div>
                      </div>))}
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* Color Palette */}
              {palette.length > 0 && (<card_1.Card>
                  <card_1.CardHeader>
                    <card_1.CardTitle className="flex items-center gap-2">
                      <lucide_react_1.Palette className="w-5 h-5"/>
                      Color Palette
                    </card_1.CardTitle>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="flex flex-wrap gap-3">
                      {palette.map((color, index) => (<div key={index} className="flex items-center gap-2">
                          <div className="w-8 h-8 border border-gray-300 rounded" style={{ backgroundColor: color }}/>
                          <span className="text-sm font-mono">{color}</span>
                        </div>))}
                    </div>
                  </card_1.CardContent>
                </card_1.Card>)}
            </>)}

          {/* Versions Tab */}
          {activeTab === 'versions' && (<card_1.Card>
              <card_1.CardHeader>
                <div className="flex items-center justify-between">
                  <card_1.CardTitle>Version History</card_1.CardTitle>
                  <link_1.default href={`/designs/${design.id}/versions/new`}>
                    <button_1.Button size="sm">
                      <lucide_react_1.Plus className="w-4 h-4 mr-1"/>
                      New Version
                    </button_1.Button>
                  </link_1.default>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {design.versions
                .sort((a, b) => b.version - a.version)
                .map(version => {
                const versionFiles = JSON.parse(version.files);
                return (<div key={version.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">Version {version.version}</h4>
                              {version.version === design.current_version && (<badge_1.Badge variant="secondary">Current</badge_1.Badge>)}
                            </div>
                            <div className="flex gap-2">
                              <link_1.default href={`/designs/${design.id}/versions/${version.version}`}>
                                <button_1.Button size="sm" variant="outline">
                                  <lucide_react_1.Eye className="w-4 h-4 mr-1"/>
                                  View
                                </button_1.Button>
                              </link_1.default>
                              <button_1.Button size="sm" variant="outline" onClick={() => runAshleyValidation(version.version)}>
                                <lucide_react_1.Zap className="w-4 h-4 mr-1"/>
                                Validate
                              </button_1.Button>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>Created: {new Date(version.created_at).toLocaleString()}</p>
                            <p>Files: {Object.keys(versionFiles).filter(key => versionFiles[key]).length} files uploaded</p>
                          </div>
                        </div>);
            })}
                </div>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Client Approvals</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {design.approvals.length > 0 ? (design.approvals
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(approval => (<div key={approval.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <badge_1.Badge className={getStatusColor(approval.status)}>
                              {approval.status.replace('_', ' ')}
                            </badge_1.Badge>
                            <span className="font-medium">Version {approval.version}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(approval.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">
                          <strong>Client:</strong> {approval.client.name}
                        </p>
                        {approval.approver_name && (<p className="text-sm">
                            <strong>Approved by:</strong> {approval.approver_name}
                          </p>)}
                        {approval.comments && (<div className="mt-2 p-2 bg-gray-50 rounded">
                            <p className="text-sm">{approval.comments}</p>
                          </div>)}
                      </div>))) : (<div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No approvals yet</p>
                    <button_1.Button onClick={() => handleSendApproval()}>
                      <lucide_react_1.Send className="w-4 h-4 mr-2"/>
                      Send for Approval
                    </button_1.Button>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>)}

          {/* AI Validation Tab */}
          {activeTab === 'validation' && (<card_1.Card>
              <card_1.CardHeader>
                <div className="flex items-center justify-between">
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Zap className="w-5 h-5"/>
                    Ashley AI Validation Results
                  </card_1.CardTitle>
                  <button_1.Button onClick={() => runAshleyValidation()}>
                    <lucide_react_1.Zap className="w-4 h-4 mr-2"/>
                    Run New Check
                  </button_1.Button>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {design.checks.length > 0 ? (design.checks
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(check => {
                const issues = check.issues ? JSON.parse(check.issues) : [];
                const metrics = check.metrics ? JSON.parse(check.metrics) : {};
                return (<div key={check.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <badge_1.Badge className={getCheckResultColor(check.result)}>
                                {check.result}
                              </badge_1.Badge>
                              <span>Version {check.version}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">{check.method}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(check.created_at).toLocaleString()}
                            </span>
                          </div>
                          
                          {issues.length > 0 && (<div className="mb-3">
                              <h5 className="font-medium mb-2">Issues Found:</h5>
                              <ul className="space-y-1">
                                {issues.map((issue, index) => (<li key={index} className="text-sm flex items-start gap-2">
                                    <lucide_react_1.AlertCircle className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0"/>
                                    <span>{issue.message}</span>
                                  </li>))}
                              </ul>
                            </div>)}
                          
                          {Object.keys(metrics).length > 0 && (<div>
                              <h5 className="font-medium mb-2">Metrics:</h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                {Object.entries(metrics).map(([key, value]) => (<div key={key} className="bg-gray-50 p-2 rounded">
                                    <div className="font-medium capitalize">
                                      {key.replace(/_/g, ' ')}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                    </div>
                                  </div>))}
                              </div>
                            </div>)}
                        </div>);
            })) : (<div className="text-center py-8">
                    <lucide_react_1.Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                    <p className="text-muted-foreground mb-4">No validation results yet</p>
                    <button_1.Button onClick={() => runAshleyValidation()}>
                      <lucide_react_1.Zap className="w-4 h-4 mr-2"/>
                      Run Ashley AI Validation
                    </button_1.Button>
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>)}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Design Preview */}
          {files.mockup_url && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Preview</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <img src={files.mockup_url} alt="Design preview" className="w-full rounded-lg" onError={(e) => {
                e.target.style.display = 'none';
            }}/>
              </card_1.CardContent>
            </card_1.Card>)}

          {/* Actions */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Actions</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3">
              {design.status === 'DRAFT' && (<>
                  <link_1.default href={`/designs/${design.id}/edit`} className="block">
                    <button_1.Button className="w-full" variant="outline">
                      <lucide_react_1.Edit className="w-4 h-4 mr-2"/>
                      Edit Design
                    </button_1.Button>
                  </link_1.default>
                  
                  <button_1.Button onClick={() => handleSendApproval()} className="w-full" disabled={submitting}>
                    <lucide_react_1.Send className="w-4 h-4 mr-2"/>
                    Send for Approval
                  </button_1.Button>
                </>)}
              
              {design.status === 'APPROVED' && (<button_1.Button onClick={() => handleLockDesign()} className="w-full bg-blue-600 hover:bg-blue-700">
                  <lucide_react_1.Lock className="w-4 h-4 mr-2"/>
                  Lock for Production
                </button_1.Button>)}
              
              <link_1.default href={`/designs/${design.id}/versions/new`} className="block">
                <button_1.Button className="w-full" variant="outline">
                  <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                  Create New Version
                </button_1.Button>
              </link_1.default>
              
              <button_1.Button className="w-full" variant="outline">
                <lucide_react_1.Share className="w-4 h-4 mr-2"/>
                Share Design
              </button_1.Button>
            </card_1.CardContent>
          </card_1.Card>

          {/* Design Info */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Design Information</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-3 text-sm">
              <div>
                <strong>Order:</strong><br />
                <link_1.default href={`/orders/${design.order.id}`} className="text-blue-600 hover:underline">
                  {design.order.order_number}
                </link_1.default>
              </div>
              <separator_1.Separator />
              <div>
                <strong>Brand:</strong><br />
                {design.brand.name} ({design.brand.code})
              </div>
              <separator_1.Separator />
              <div>
                <strong>Method:</strong><br />
                <badge_1.Badge className={getMethodColor(design.method)} variant="outline">
                  {design.method}
                </badge_1.Badge>
              </div>
              <separator_1.Separator />
              <div>
                <strong>Current Version:</strong><br />
                v{design.current_version}
              </div>
              <separator_1.Separator />
              <div>
                <strong>Statistics:</strong><br />
                {design._count.versions} versions<br />
                {design._count.approvals} approvals<br />
                {design._count.checks} AI checks
              </div>
              <separator_1.Separator />
              <div>
                <strong>Created:</strong><br />
                {new Date(design.created_at).toLocaleDateString()}
              </div>
              <div>
                <strong>Last Updated:</strong><br />
                {new Date(design.updated_at).toLocaleDateString()}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Send Approval */}
          {design.status === 'DRAFT' && (<card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Send for Approval</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-3">
                <textarea_1.Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment for the client (optional)..." rows={3}/>
                <button_1.Button onClick={() => handleSendApproval()} className="w-full" disabled={submitting}>
                  <lucide_react_1.Send className="w-4 h-4 mr-2"/>
                  {submitting ? 'Sending...' : 'Send for Approval'}
                </button_1.Button>
              </card_1.CardContent>
            </card_1.Card>)}
        </div>
      </div>
    </div>);
}
