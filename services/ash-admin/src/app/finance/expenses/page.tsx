"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  Plus,
  Download,
  Filter,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Types
interface Expense {
  id: string;
  workspace_id: string;
  category:
    | "RAW_MATERIALS"
    | "UTILITIES"
    | "SALARIES"
    | "RENT"
    | "EQUIPMENT"
    | "MARKETING"
    | "TRANSPORTATION"
    | "MAINTENANCE"
    | "SUPPLIES"
    | "MISCELLANEOUS";
  amount: number;
  currency: string;
  description: string;
  date: string;
  supplier: string | null;
  invoice_number: string | null;
  payment_method:
    | "CASH"
    | "BANK_TRANSFER"
    | "CHECK"
    | "CREDIT_CARD"
    | "GCASH"
    | "PAYMAYA"
    | "ONLINE_BANKING"
    | null;
  payment_date: string | null;
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  approved_by: string | null;
  cost_center_id: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ExpenseFormData {
  category: string;
  amount: string;
  currency: string;
  description: string;
  date: string;
  supplier: string;
  invoice_number: string;
  payment_method: string;
  payment_date: string;
  receipt_url: string;
  notes: string;
  cost_center_id: string;
}

const CATEGORIES = [
  { value: "RAW_MATERIALS", label: "Raw Materials" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "SALARIES", label: "Salaries" },
  { value: "RENT", label: "Rent" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "MARKETING", label: "Marketing" },
  { value: "TRANSPORTATION", label: "Transportation" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "SUPPLIES", label: "Supplies" },
  { value: "MISCELLANEOUS", label: "Miscellaneous" },
];

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CHECK", label: "Check" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "GCASH", label: "GCash" },
  { value: "PAYMAYA", label: "PayMaya" },
  { value: "ONLINE_BANKING", label: "Online Banking" },
];

const APPROVAL_STATUSES = [
  { value: "PENDING", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "APPROVED", label: "Approved", color: "bg-green-100 text-green-800" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-800" },
];

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"APPROVED" | "REJECTED">("APPROVED");

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Form data
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: "",
    amount: "",
    currency: "PHP",
    description: "",
    date: new Date().toISOString().split("T")[0] || "",
    supplier: "",
    invoice_number: "",
    payment_method: "",
    payment_date: "",
    receipt_url: "",
    notes: "",
    cost_center_id: "",
  });

  // Fetch expenses
  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await fetch("/api/finance/expenses");
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return res.json();
    },
  });

  // Create expense mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Expense>) => {
      const res = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create expense");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense created successfully");
      setShowCreateModal(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create expense");
    },
  });

  // Update expense mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Expense> }) => {
      const res = await fetch("/api/finance/expenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (!res.ok) throw new Error("Failed to update expense");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense updated successfully");
      setShowViewModal(false);
      setIsEditing(false);
      setSelectedExpense(null);
    },
    onError: () => {
      toast.error("Failed to update expense");
    },
  });

  // Delete expense mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/finance/expenses?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete expense");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted successfully");
      setShowDeleteDialog(false);
      setShowViewModal(false);
      setSelectedExpense(null);
    },
    onError: () => {
      toast.error("Failed to delete expense");
    },
  });

  // Approve/Reject expense
  const approveMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => {
      const res = await fetch("/api/finance/expenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          approval_status: status,
          approved_by: "current-user-id",
        }),
      });
      if (!res.ok) throw new Error("Failed to update approval status");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      const statusText = variables.status === "APPROVED" ? "approved" : "rejected";
      toast.success(`Expense ${statusText} successfully`);
      setShowApproveDialog(false);
      setShowViewModal(false);
      setSelectedExpense(null);
    },
    onError: () => {
      toast.error("Failed to update approval status");
    },
  });

  // Calculate dashboard stats
  const stats = React.useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      );
    });

    const totalThisMonth = thisMonthExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const pendingCount = expenses.filter(
      (exp) => exp.approval_status === "PENDING"
    ).length;
    const approvedTotal = expenses
      .filter((exp) => exp.approval_status === "APPROVED")
      .reduce((sum, exp) => sum + exp.amount, 0);

    // Top category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] =
        (categoryTotals[exp.category] || 0) + exp.amount;
    });
    const topCategory = Object.entries(categoryTotals).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      totalThisMonth,
      pendingCount,
      approvedTotal,
      topCategory: topCategory
        ? {
            name: CATEGORIES.find((c) => c.value === topCategory[0])?.label || "",
            amount: topCategory[1],
          }
        : null,
    };
  }, [expenses]);

  // Filter expenses
  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((expense) => {
      if (categoryFilter && expense.category !== categoryFilter) return false;
      if (statusFilter && expense.approval_status !== statusFilter) return false;
      if (
        searchTerm &&
        !expense.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !expense.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !expense.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      if (dateFrom && new Date(expense.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(expense.date) > new Date(dateTo)) return false;
      return true;
    });
  }, [expenses, categoryFilter, statusFilter, searchTerm, dateFrom, dateTo]);

  // Handlers
  const resetForm = () => {
    setFormData({
      category: "",
      amount: "",
      currency: "PHP",
      description: "",
      date: new Date().toISOString().split("T")[0] || "",
      supplier: "",
      invoice_number: "",
      payment_method: "",
      payment_date: "",
      receipt_url: "",
      notes: "",
      cost_center_id: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedExpense) {
      updateMutation.mutate({
        id: selectedExpense.id,
        data: {
          category: formData.category as Expense["category"],
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description,
          date: formData.date,
          supplier: formData.supplier || null,
          invoice_number: formData.invoice_number || null,
          payment_method: (formData.payment_method as Expense["payment_method"]) || null,
          payment_date: formData.payment_date || null,
          receipt_url: formData.receipt_url || null,
          notes: formData.notes || null,
          cost_center_id: formData.cost_center_id || null,
        },
      });
    } else {
      createMutation.mutate({
        category: formData.category as Expense["category"],
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        date: formData.date,
        supplier: formData.supplier || null,
        invoice_number: formData.invoice_number || null,
        payment_method: (formData.payment_method as Expense["payment_method"]) || null,
        payment_date: formData.payment_date || null,
        approval_status: "PENDING",
        receipt_url: formData.receipt_url || null,
        notes: formData.notes || null,
        cost_center_id: formData.cost_center_id || null,
      });
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      currency: expense.currency,
      description: expense.description,
      date: expense.date.split("T")[0] || "",
      supplier: expense.supplier || "",
      invoice_number: expense.invoice_number || "",
      payment_method: expense.payment_method || "",
      payment_date: expense.payment_date?.split("T")[0] || "",
      receipt_url: expense.receipt_url || "",
      notes: expense.notes || "",
      cost_center_id: expense.cost_center_id || "",
    });
    setIsEditing(true);
    setShowViewModal(true);
  };

  const handleView = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditing(false);
    setShowViewModal(true);
  };

  const handleApprove = (status: "APPROVED" | "REJECTED") => {
    if (!selectedExpense) return;
    setApprovalAction(status);
    setShowApproveDialog(true);
  };

  const confirmApproval = () => {
    if (!selectedExpense) return;
    approveMutation.mutate({ id: selectedExpense.id, status: approvalAction });
  };

  const handleDelete = () => {
    if (!selectedExpense) return;
    deleteMutation.mutate(selectedExpense.id);
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Category",
      "Description",
      "Amount",
      "Currency",
      "Supplier",
      "Invoice Number",
      "Payment Method",
      "Payment Date",
      "Status",
      "Notes",
    ];
    const rows = filteredExpenses.map((exp) => [
      exp.date.split("T")[0],
      CATEGORIES.find((c) => c.value === exp.category)?.label || exp.category,
      exp.description,
      exp.amount,
      exp.currency,
      exp.supplier || "",
      exp.invoice_number || "",
      exp.payment_method || "",
      exp.payment_date?.split("T")[0] || "",
      exp.approval_status,
      exp.notes || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Expenses exported to CSV");
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
        <p className="text-gray-600 mt-1">
          Track and manage company expenses
        </p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalThisMonth, "PHP")}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600">Current month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.pendingCount}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-1" />
            <span className="text-yellow-600">Awaiting review</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.approvedTotal, "PHP")}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600">All time</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Top Category</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {stats.topCategory?.name || "N/A"}
              </p>
              {stats.topCategory && (
                <p className="text-sm text-gray-600">
                  {formatCurrency(stats.topCategory.amount, "PHP")}
                </p>
              )}
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search supplier, invoice..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {APPROVAL_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {/* Date From */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Expense
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setCategoryFilter("");
              setStatusFilter("");
              setSearchTerm("");
              setDateFrom("");
              setDateTo("");
            }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {CATEGORIES.find((c) => c.value === expense.category)
                          ?.label || expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{expense.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.supplier || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount, expense.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.payment_method || "Unpaid"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          APPROVAL_STATUSES.find(
                            (s) => s.value === expense.approval_status
                          )?.color
                        }`}
                      >
                        {expense.approval_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(expense)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedExpense(expense);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Expense Modal */}
      {(showCreateModal || (showViewModal && isEditing)) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Edit Expense" : "Create New Expense"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                  />
                </div>

                {/* Invoice Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.invoice_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invoice_number: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_method: e.target.value })
                    }
                  >
                    <option value="">Select payment method</option>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_date: e.target.value })
                    }
                  />
                </div>

                {/* Receipt URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.receipt_url}
                    onChange={(e) =>
                      setFormData({ ...formData, receipt_url: e.target.value })
                    }
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowViewModal(false);
                    setIsEditing(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : isEditing
                    ? "Update Expense"
                    : "Create Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Expense Modal */}
      {showViewModal && !isEditing && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Expense Details
                </h2>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    APPROVAL_STATUSES.find(
                      (s) => s.value === selectedExpense.approval_status
                    )?.color
                  }`}
                >
                  {selectedExpense.approval_status}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Category
                  </label>
                  <p className="text-gray-900">
                    {CATEGORIES.find((c) => c.value === selectedExpense.category)
                      ?.label || selectedExpense.category}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Amount
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {formatCurrency(
                      selectedExpense.amount,
                      selectedExpense.currency
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedExpense.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Supplier
                  </label>
                  <p className="text-gray-900">
                    {selectedExpense.supplier || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Invoice Number
                  </label>
                  <p className="text-gray-900">
                    {selectedExpense.invoice_number || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Payment Method
                  </label>
                  <p className="text-gray-900">
                    {selectedExpense.payment_method || "Unpaid"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Payment Date
                  </label>
                  <p className="text-gray-900">
                    {selectedExpense.payment_date
                      ? new Date(selectedExpense.payment_date).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900">{selectedExpense.description}</p>
                </div>
                {selectedExpense.notes && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Notes
                    </label>
                    <p className="text-gray-900">{selectedExpense.notes}</p>
                  </div>
                )}
                {selectedExpense.receipt_url && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Receipt
                    </label>
                    <a
                      href={selectedExpense.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Receipt
                    </a>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  {selectedExpense.approval_status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleApprove("APPROVED")}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprove("REJECTED")}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(selectedExpense)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Confirmation Dialog */}
      {showApproveDialog && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              {approvalAction === "APPROVED" ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <h3 className="text-xl font-bold text-gray-900">
                {approvalAction === "APPROVED" ? "Approve" : "Reject"} Expense
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {approvalAction === "APPROVED" ? "approve" : "reject"} this expense
              of {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApproveDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmApproval}
                disabled={approveMutation.isPending}
                className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  approvalAction === "APPROVED"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {approveMutation.isPending
                  ? "Processing..."
                  : `Yes, ${approvalAction === "APPROVED" ? "Approve" : "Reject"}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
              <h3 className="text-xl font-bold text-gray-900">Delete Expense</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this expense? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
