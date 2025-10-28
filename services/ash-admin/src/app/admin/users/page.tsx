"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import PermissionGate from "@/components/PermissionGate";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  position?: string;
  department?: string;
  phone_number?: string;
  is_active: boolean;
  requires_2fa: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const ___router = useRouter();

  const roles = [
    { value: "admin", label: "Administrator" },
    { value: "manager", label: "Manager" },
    { value: "designer", label: "Designer" },
    { value: "cutting_operator", label: "Cutting Operator" },
    { value: "printing_operator", label: "Printing Operator" },
    { value: "sewing_operator", label: "Sewing Operator" },
    { value: "qc_inspector", label: "QC Inspector" },
    { value: "finishing_operator", label: "Finishing Operator" },
    { value: "warehouse_staff", label: "Warehouse Staff" },
    { value: "finance_staff", label: "Finance Staff" },
    { value: "hr_staff", label: "HR Staff" },
    { value: "maintenance_tech", label: "Maintenance Tech" },
  ];

  const departments = [
    "Administration",
    "Sales",
    "Design",
    "Production",
    "Quality",
    "Finishing",
    "Warehouse",
    "Finance",
    "HR",
    "Maintenance",
  ];

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, departmentFilter, statusFilter, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(departmentFilter !== "all" && { department: departmentFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const token = localStorage.getItem("ash_token");
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const token = localStorage.getItem("ash_token");
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const handleUpdateUser = async (userData: any) => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("ash_token");
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.email}"?`))
      return;

    try {
      const token = localStorage.getItem("ash_token");
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const getRoleLabel = (role: string) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-purple-100 text-purple-800";
      case "designer":
        return "bg-blue-100 text-blue-800";
      case "finance_staff":
        return "bg-green-100 text-green-800";
      case "hr_staff":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <PermissionGate
      roles={["admin"]}
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Shield className="mx-auto mb-4 h-16 w-16 text-gray-500" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-500">
              You need Administrator privileges to access User Management.
            </p>
          </div>
        </div>
      }
    >
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
          {/* Header */}
          <header className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center text-2xl font-bold text-gray-900">
                  <Users className="mr-3 h-8 w-8 text-blue-600" />
                  User Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-500">
                  Manage employee accounts and permissions
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </button>
            </div>
          </header>

          {/* Filters */}
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="min-w-64 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <main className="px-6 py-6">
            <div className="rounded-lg bg-white shadow">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                  <p className="text-gray-600 dark:text-gray-500">
                    Loading users...
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Last Login
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {users.map(user => (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-50 dark:bg-gray-800"
                          >
                            <td className="whitespace-nowrap px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-500">
                                  {user.email}
                                </div>
                                <div className="text-xs text-gray-500">
                                  @{user.username}
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleBadgeColor(user.role)}`}
                              >
                                {getRoleLabel(user.role)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {user.department || "-"}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center">
                                {user.is_active ? (
                                  <>
                                    <UserCheck className="mr-1 h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-600 dark:text-green-400">
                                      Active
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <UserX className="mr-1 h-4 w-4 text-red-500" />
                                    <span className="text-sm text-red-600 dark:text-red-400">
                                      Inactive
                                    </span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-500">
                              {user.last_login_at
                                ? new Date(
                                    user.last_login_at
                                  ).toLocaleDateString()
                                : "Never"}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowEditModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-100"
                                  title="Edit user"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete user"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-600">
                          Page {page} of {totalPages}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>

          {/* Create User Modal */}
          {showCreateModal && (
            <CreateUserModal
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateUser}
              roles={roles}
              departments={departments}
            />
          )}

          {/* Edit User Modal */}
          {showEditModal && selectedUser && (
            <EditUserModal
              user={selectedUser}
              onClose={() => {
                setShowEditModal(false);
                setSelectedUser(null);
              }}
              onSubmit={handleUpdateUser}
              roles={roles}
              departments={departments}
            />
          )}
        </div>
      </DashboardLayout>
    </PermissionGate>
  );
}

// Create User Modal Component
function CreateUserModal({ onClose, onSubmit, roles, departments }: any) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    role: "cutting_operator",
    position: "",
    department: "Production",
    phone_number: "",
    password: "",
    is_active: true,
    requires_2fa: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-screen w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Create New User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={e =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={e =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={e =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={e =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={formData.role}
                onChange={e =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {roles.map((role: any) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                value={formData.department}
                onChange={e =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {departments.map((dept: string) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Position
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={e =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone_number}
              onChange={e =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={e =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="mr-2"
              />
              Active
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requires_2fa}
                onChange={e =>
                  setFormData({ ...formData, requires_2fa: e.target.checked })
                }
                className="mr-2"
              />
              Require 2FA
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSubmit, roles, departments }: any) {
  const [formData, setFormData] = useState({
    email: user.email,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    position: user.position || "",
    department: user.department || "Production",
    phone_number: user.phone_number || "",
    is_active: user.is_active,
    requires_2fa: user.requires_2fa,
    password: "", // Leave empty unless changing
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only include password if it's provided
    const submitData: any = { ...formData };
    if (!submitData.password) {
      delete submitData.password;
    }
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-screen w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Edit User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={e =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={e =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={e =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              New Password (leave empty to keep current)
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={e =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={formData.role}
                onChange={e =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {roles.map((role: any) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                value={formData.department}
                onChange={e =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {departments.map((dept: string) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Position
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={e =>
                setFormData({ ...formData, position: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone_number}
              onChange={e =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={e =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="mr-2"
              />
              Active
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requires_2fa}
                onChange={e =>
                  setFormData({ ...formData, requires_2fa: e.target.checked })
                }
                className="mr-2"
              />
              Require 2FA
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
