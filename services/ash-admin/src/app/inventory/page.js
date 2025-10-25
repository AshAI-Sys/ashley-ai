"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InventoryPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
function InventoryPage() {
    const [activeTab, setActiveTab] = (0, react_1.useState)("materials");
    const summary = {
        total_materials: 145,
        total_value: 2850000,
        low_stock_count: 8,
        out_of_stock_count: 3,
        pending_pos: 5,
        monthly_waste_cost: 45000,
    };
    return (<div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Inventory Management
        </h1>
        <p className="mt-2 text-gray-600">
          Materials, suppliers, and stock control
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="mb-1 text-sm text-gray-600">Total Materials</p>
          <p className="text-2xl font-bold text-gray-900">
            {summary.total_materials}
          </p>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <p className="mb-1 text-sm text-gray-600">Stock Value</p>
          <p className="text-2xl font-bold text-green-600">
            ₱{(summary.total_value / 1000000).toFixed(1)}M
          </p>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="mb-1 text-sm text-yellow-700">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-800">
            {summary.low_stock_count}
          </p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="mb-1 text-sm text-red-700">Out of Stock</p>
          <p className="text-2xl font-bold text-red-800">
            {summary.out_of_stock_count}
          </p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="mb-1 text-sm text-blue-700">Pending POs</p>
          <p className="text-2xl font-bold text-blue-800">
            {summary.pending_pos}
          </p>
        </div>

        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <p className="mb-1 text-sm text-purple-700">Monthly Waste</p>
          <p className="text-2xl font-bold text-purple-800">
            ₱{(summary.monthly_waste_cost / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
            { id: "materials", label: "Materials", icon: lucide_react_1.Package },
            { id: "suppliers", label: "Suppliers", icon: lucide_react_1.TruckIcon },
            {
                id: "purchase-orders",
                label: "Purchase Orders",
                icon: lucide_react_1.DollarSign,
            },
            { id: "alerts", label: "Stock Alerts", icon: lucide_react_1.AlertTriangle },
        ].map(tab => {
            const Icon = tab.icon;
            return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  <Icon className="mr-2 inline-block h-5 w-5"/>
                  {tab.label}
                </button>);
        })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "materials" && <MaterialsTab />}
          {activeTab === "suppliers" && <SuppliersTab />}
          {activeTab === "purchase-orders" && <PurchaseOrdersTab />}
          {activeTab === "alerts" && <AlertsTab />}
        </div>
      </div>
    </div>);
}
function MaterialsTab() {
    const router = (0, navigation_1.useRouter)();
    const materials = [
        {
            sku: "FAB-001",
            name: "Cotton Fabric - White",
            category: "FABRIC",
            stock: 500,
            unit: "YARDS",
            reorder: 200,
            cost: 150,
        },
        {
            sku: "THR-001",
            name: "Polyester Thread - Black",
            category: "THREAD",
            stock: 1500,
            unit: "ROLLS",
            reorder: 500,
            cost: 45,
        },
        {
            sku: "FAB-002",
            name: "Denim Fabric - Blue",
            category: "FABRIC",
            stock: 180,
            unit: "YARDS",
            reorder: 200,
            cost: 280,
        },
        {
            sku: "TRM-001",
            name: "Metal Buttons - Silver",
            category: "TRIM",
            stock: 5000,
            unit: "PIECES",
            reorder: 2000,
            cost: 2.5,
        },
    ];
    return (<div>
      <div className="mb-6 flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <lucide_react_1.Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-500"/>
          <input type="text" placeholder="Search materials by SKU or name..." className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div className="flex gap-2">
          <button onClick={() => router.push("/inventory/scan-barcode")} className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50">
            <lucide_react_1.QrCode className="h-4 w-4"/>
            Scan Barcode
          </button>
          <button onClick={() => router.push("/inventory/add-material")} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            <lucide_react_1.Plus className="h-4 w-4"/>
            Add Material
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Material Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Reorder Point
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Unit Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {materials.map(mat => {
            const _stockPercent = (mat.stock / (mat.reorder * 3)) * 100;
            const isLow = mat.stock <= mat.reorder;
            return (<tr key={mat.sku} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {mat.sku}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {mat.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {mat.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isLow ? "text-red-600" : "text-gray-900"}`}>
                        {mat.stock} {mat.unit}
                      </span>
                      {isLow && (<lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500"/>)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {mat.reorder} {mat.unit}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    ₱{mat.cost.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button onClick={() => alert(`Adjust stock for ${mat.name}`)} className="mr-3 text-blue-600 hover:text-blue-800">
                      Adjust
                    </button>
                    <button onClick={() => alert(`Create reorder PO for ${mat.name}`)} className="text-green-600 hover:text-green-800">
                      Reorder
                    </button>
                  </td>
                </tr>);
        })}
          </tbody>
        </table>
      </div>
    </div>);
}
function SuppliersTab() {
    const router = (0, navigation_1.useRouter)();
    const suppliers = [
        {
            name: "Fabric Suppliers Inc.",
            contact: "John Doe",
            email: "john@fabrics.com",
            phone: "+63 917 123 4567",
            rating: 4.5,
        },
        {
            name: "Thread & Trim Co.",
            contact: "Jane Smith",
            email: "jane@thread.com",
            phone: "+63 917 234 5678",
            rating: 4.8,
        },
        {
            name: "Global Textiles",
            contact: "Bob Johnson",
            email: "bob@global.com",
            phone: "+63 917 345 6789",
            rating: 4.2,
        },
    ];
    return (<div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Suppliers</h2>
        <button onClick={() => router.push("/inventory/add-supplier")} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <lucide_react_1.Plus className="h-4 w-4"/>
          Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier, idx) => (<div key={idx} className="rounded-lg border border-gray-200 p-6 transition-shadow hover:shadow-lg">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium">{supplier.rating}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Contact:</strong> {supplier.contact}
              </p>
              <p>
                <strong>Email:</strong> {supplier.email}
              </p>
              <p>
                <strong>Phone:</strong> {supplier.phone}
              </p>
            </div>

            <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4">
              <button onClick={() => alert(`View details for ${supplier.name}`)} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                View Details
              </button>
              <button onClick={() => router.push(`/inventory/create-po?supplier=${encodeURIComponent(supplier.name)}`)} className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
                Create PO
              </button>
            </div>
          </div>))}
      </div>
    </div>);
}
function PurchaseOrdersTab() {
    const router = (0, navigation_1.useRouter)();
    const [orders, setOrders] = (0, react_1.useState)([
        {
            po: "PO-000123",
            supplier: "Fabric Suppliers Inc.",
            date: "2024-10-01",
            delivery: "2024-10-08",
            amount: 125000,
            status: "PENDING",
        },
        {
            po: "PO-000124",
            supplier: "Thread & Trim Co.",
            date: "2024-10-02",
            delivery: "2024-10-09",
            amount: 45000,
            status: "APPROVED",
        },
        {
            po: "PO-000125",
            supplier: "Global Textiles",
            date: "2024-09-28",
            delivery: "2024-10-05",
            amount: 280000,
            status: "RECEIVED",
        },
    ]);
    const handleApprove = (poNumber) => {
        setOrders(orders.map(order => order.po === poNumber
            ? { ...order, status: "APPROVED" }
            : order));
        alert(`Purchase Order ${poNumber} approved successfully!`);
    };
    const handleMarkReceived = (poNumber) => {
        setOrders(orders.map(order => order.po === poNumber
            ? { ...order, status: "RECEIVED" }
            : order));
        alert(`Purchase Order ${poNumber} marked as received!`);
    };
    return (<div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Purchase Orders</h2>
        <button onClick={() => router.push("/inventory/create-po")} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <lucide_react_1.Plus className="h-4 w-4"/>
          Create PO
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                PO Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Order Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Delivery Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {orders.map(order => (<tr key={order.po} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {order.po}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {order.supplier}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {order.date}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                  {order.delivery}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  ₱{order.amount.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${order.status === "RECEIVED"
                ? "bg-green-100 text-green-800"
                : order.status === "APPROVED"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"}`}>
                    {order.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {order.status === "APPROVED" && (<button onClick={() => handleMarkReceived(order.po)} className="text-green-600 hover:text-green-800">
                      Mark Received
                    </button>)}
                  {order.status === "PENDING" && (<button onClick={() => handleApprove(order.po)} className="text-blue-600 hover:text-blue-800">
                      Approve
                    </button>)}
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>);
}
function AlertsTab() {
    const router = (0, navigation_1.useRouter)();
    const stockAlerts = [
        {
            material: "Denim Fabric - Blue",
            type: "LOW_STOCK",
            severity: "WARNING",
            current: 180,
            threshold: 200,
            message: "Below reorder point",
        },
        {
            material: "Cotton Fabric - Red",
            type: "OUT_OF_STOCK",
            severity: "CRITICAL",
            current: 0,
            threshold: 150,
            message: "Completely out of stock",
        },
        {
            material: 'Zipper - Metal 10"',
            type: "OUT_OF_STOCK",
            severity: "CRITICAL",
            current: 0,
            threshold: 500,
            message: "Completely out of stock",
        },
        {
            material: 'Elastic Band - 1"',
            type: "LOW_STOCK",
            severity: "WARNING",
            current: 450,
            threshold: 500,
            message: "Below reorder point",
        },
    ];
    return (<div>
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Stock Alerts
        </h2>
        <p className="text-gray-600">Materials requiring immediate attention</p>
      </div>

      <div className="space-y-4">
        {stockAlerts.map((stockAlert, idx) => (<div key={idx} className={`rounded-lg border-l-4 p-4 ${stockAlert.severity === "CRITICAL"
                ? "border-red-500 bg-red-50"
                : "border-yellow-500 bg-yellow-50"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <lucide_react_1.AlertTriangle className={`h-6 w-6 ${stockAlert.severity === "CRITICAL"
                ? "text-red-500"
                : "text-yellow-500"}`}/>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {stockAlert.material}
                  </h3>
                  <p className={`text-sm ${stockAlert.severity === "CRITICAL"
                ? "text-red-700"
                : "text-yellow-700"}`}>
                    {stockAlert.message} • Current: {stockAlert.current} /
                    Threshold: {stockAlert.threshold}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.alert(`View details for ${stockAlert.material}`)} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50">
                  View Material
                </button>
                <button onClick={() => window.alert(`Creating auto-reorder PO for ${stockAlert.material}`)} className={`rounded px-4 py-2 text-sm text-white ${stockAlert.severity === "CRITICAL"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-yellow-600 hover:bg-yellow-700"}`}>
                  Auto-Reorder
                </button>
              </div>
            </div>
          </div>))}
      </div>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="mb-3 font-semibold text-blue-900">
          Auto-Reordering Status
        </h3>
        <p className="mb-4 text-sm text-blue-800">
          Automatic purchase orders will be created when stock reaches reorder
          point
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-700">
            Auto-reorder enabled for 8 materials
          </span>
          <button onClick={() => router.push("/inventory/auto-reorder-settings")} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            Configure Auto-Reorder
          </button>
        </div>
      </div>
    </div>);
}
