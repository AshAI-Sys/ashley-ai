"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Unused import removed: Textarea
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  GitBranch,
  Search, ArrowRight,
  CheckCircle, AlertCircle,
  Shirt,
} from "lucide-react";

interface SewingOperation {
  id: string;
  product_type: string;
  name: string;
  standard_minutes: number;
  piece_rate?: number;
  depends_on?: string[];
  created_at: string;
  updated_at: string;
}

interface ProductType {
  value: string;
  label: string;
  operations: string[];
}

const productTypes: ProductType[] = [
  {
    value: "T-Shirt",
    label: "T-Shirt",
    operations: [
      "Cut neck",
      "Attach sleeves",
      "Side seams",
      "Hem bottom",
      "Neck binding",
    ],
  },
  {
    value: "Hoodie",
    label: "Hoodie",
    operations: [
      "Join shoulders",
      "Attach collar",
      "Set sleeves",
      "Side seams",
      "Hem bottom",
      "Pocket attachment",
      "Hood assembly",
    ],
  },
  {
    value: "Polo",
    label: "Polo Shirt",
    operations: [
      "Join shoulders",
      "Attach collar",
      "Set sleeves",
      "Side seams",
      "Hem bottom",
      "Placket creation",
      "Button attachment",
    ],
  },
  {
    value: "Jersey",
    label: "Sports Jersey",
    operations: [
      "Join shoulders",
      "Set sleeves",
      "Side seams",
      "Hem bottom",
      "Number application",
      "Name application",
    ],
  },
];

export default function SewingOperationsPage() {
  const [operations, setOperations] = useState<SewingOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] =
    useState<SewingOperation | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    product_type: "",
    name: "",
    standard_minutes: "",
    piece_rate: "",
    depends_on: [] as string[],
  });

  useEffect(() => {
    fetchOperations();
  }, [search, productTypeFilter]);

  const fetchOperations = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (productTypeFilter) params.append("product_type", productTypeFilter);

      const response = await fetch(`/api/sewing/operations?${params}`);

      if (response.ok) {
        const data = await response.json();
        setOperations(data.data || []);
      } else {
        // Mock data for demo
        const mockOperations: SewingOperation[] = [
          {
            id: "1",
            product_type: "Hoodie",
            name: "Join shoulders",
            standard_minutes: 1.5,
            piece_rate: 2.25,
            depends_on: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            product_type: "Hoodie",
            name: "Attach collar",
            standard_minutes: 2.0,
            piece_rate: 3.0,
            depends_on: ["Join shoulders"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "3",
            product_type: "Hoodie",
            name: "Set sleeves",
            standard_minutes: 3.5,
            piece_rate: 5.25,
            depends_on: ["Join shoulders"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "4",
            product_type: "Hoodie",
            name: "Side seams",
            standard_minutes: 2.8,
            piece_rate: 4.2,
            depends_on: ["Set sleeves"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "5",
            product_type: "Hoodie",
            name: "Hood assembly",
            standard_minutes: 4.0,
            piece_rate: 6.0,
            depends_on: ["Attach collar"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "6",
            product_type: "Hoodie",
            name: "Pocket attachment",
            standard_minutes: 1.8,
            piece_rate: 2.7,
            depends_on: ["Side seams"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "7",
            product_type: "Hoodie",
            name: "Hem bottom",
            standard_minutes: 1.2,
            piece_rate: 1.8,
            depends_on: ["Side seams"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "8",
            product_type: "T-Shirt",
            name: "Cut neck",
            standard_minutes: 0.8,
            piece_rate: 1.2,
            depends_on: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "9",
            product_type: "T-Shirt",
            name: "Attach sleeves",
            standard_minutes: 2.0,
            piece_rate: 3.0,
            depends_on: ["Cut neck"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "10",
            product_type: "T-Shirt",
            name: "Side seams",
            standard_minutes: 1.8,
            piece_rate: 2.7,
            depends_on: ["Attach sleeves"],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        // Filter by product type if needed
        const filteredOps = productTypeFilter
          ? mockOperations.filter(op => op.product_type === productTypeFilter)
          : mockOperations;

        // Filter by search term if needed
        const searchFiltered = search
          ? filteredOps.filter(
              op =>
                op.name.toLowerCase().includes(search.toLowerCase()) ||
                op.product_type.toLowerCase().includes(search.toLowerCase())
            )
          : filteredOps;

        setOperations(searchFiltered);
      }
    } catch (error) {
      console.error("Failed to fetch operations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOperation = async () => {
    try {
      const operationData = {
        ...formData,
        standard_minutes: parseFloat(formData.standard_minutes),
        piece_rate: formData.piece_rate
          ? parseFloat(formData.piece_rate)
          : null,
      };

      const response = await fetch("/api/sewing/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(operationData),
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        resetForm();
        fetchOperations();
      } else {
        // For demo, just add to local state
        const newOperation: SewingOperation = {
          id: Date.now().toString(),
          product_type: formData.product_type,
          name: formData.name,
          standard_minutes: parseFloat(formData.standard_minutes),
          piece_rate: formData.piece_rate
            ? parseFloat(formData.piece_rate)
            : undefined,
          depends_on: formData.depends_on,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setOperations(prev => [...prev, newOperation]);
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to create operation:", error);
    }
  };

  const handleEditOperation = async () => {
    if (!selectedOperation) return;

    try {
      const operationData = {
        ...formData,
        standard_minutes: parseFloat(formData.standard_minutes),
        piece_rate: formData.piece_rate
          ? parseFloat(formData.piece_rate)
          : null,
      };

      const response = await fetch(
        `/api/sewing/operations/${selectedOperation.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(operationData),
        }
      );

      if (response.ok) {
        setIsEditDialogOpen(false);
        setSelectedOperation(null);
        resetForm();
        fetchOperations();
      } else {
        // For demo, just update local state
        setOperations(prev =>
          prev.map(op =>
            op.id === selectedOperation.id
              ? ({
                  ...op,
                  ...operationData,
                  updated_at: new Date().toISOString(),
                } as SewingOperation)
              : op
          )
        );
        setIsEditDialogOpen(false);
        setSelectedOperation(null);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to update operation:", error);
    }
  };

  const handleDeleteOperation = async (operationId: string) => {
    if (!confirm("Are you sure you want to delete this operation?")) return;

    try {
      const response = await fetch(`/api/sewing/operations/${operationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchOperations();
      } else {
        // For demo, just remove from local state
        setOperations(prev => prev.filter(op => op.id !== operationId));
      }
    } catch (error) {
      console.error("Failed to delete operation:", error);
    }
  };

  const openEditDialog = (operation: SewingOperation) => {
    setSelectedOperation(operation);
    setFormData({
      product_type: operation.product_type,
      name: operation.name,
      standard_minutes: operation.standard_minutes.toString(),
      piece_rate: operation.piece_rate?.toString() || "",
      depends_on: operation.depends_on || [],
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      product_type: "",
      name: "",
      standard_minutes: "",
      piece_rate: "",
      depends_on: [],
    });
  };

  const getDependencyBadgeColor = (dependsOn?: string[]) => {
    if (!dependsOn || dependsOn.length === 0)
      return "bg-green-100 text-green-800";
    if (dependsOn.length === 1) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const groupedOperations = operations.reduce(
    (groups, operation) => {
      const type = operation.product_type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(operation);
      return groups;
    },
    {} as Record<string, SewingOperation[]>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <Settings className="mx-auto mb-4 h-8 w-8 animate-pulse" />
            <p>Loading operations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sewing Operations</h1>
          <p className="text-muted-foreground">
            Manage operation library with SMV and piece rates
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Operation
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Operations
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{operations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Types</CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(groupedOperations).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg SMV</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operations.length > 0
                ? (
                    operations.reduce(
                      (sum, op) => sum + op.standard_minutes,
                      0
                    ) / operations.length
                  ).toFixed(1)
                : "0"}
              m
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              â‚±
              {operations.filter(op => op.piece_rate).length > 0
                ? (
                    operations
                      .filter(op => op.piece_rate)
                      .reduce((sum, op) => sum + (op.piece_rate || 0), 0) /
                    operations.filter(op => op.piece_rate).length
                  ).toFixed(2)
                : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="max-w-sm flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search operations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-11"
                />
              </div>
            </div>

            <Select
              value={productTypeFilter}
              onValueChange={setProductTypeFilter}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All product types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All product types</SelectItem>
                {productTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Operations by Product Type */}
      <div className="space-y-6">
        {Object.entries(groupedOperations).map(
          ([productType, typeOperations]) => (
            <Card key={productType}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="h-5 w-5" />
                  {productType}
                  <Badge variant="outline">
                    {typeOperations.length} operations
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Standard manufacturing operations for{" "}
                  {productType.toLowerCase()} production
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {typeOperations.map(operation => (
                    <div
                      key={operation.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="font-medium">{operation.name}</h3>
                          <Badge
                            className={getDependencyBadgeColor(
                              operation.depends_on
                            )}
                          >
                            {!operation.depends_on ||
                            operation.depends_on.length === 0
                              ? "No dependencies"
                              : `${operation.depends_on.length} ${operation.depends_on.length === 1 ? "dependency" : "dependencies"}`}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground md:grid-cols-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {operation.standard_minutes} minutes SMV
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              â‚±{operation.piece_rate?.toFixed(2) || "N/A"} per
                              piece
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            <span>
                              {operation.depends_on &&
                              operation.depends_on.length > 0
                                ? `After: ${operation.depends_on.join(", ")}`
                                : "Starting operation"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(operation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteOperation(operation.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        )}

        {operations.length === 0 && (
          <Card>
            <CardContent className="flex h-32 items-center justify-center">
              <div className="text-center">
                <Settings className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No operations found</p>
                <Button
                  className="mt-2"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Create First Operation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Operation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Operation</DialogTitle>
            <DialogDescription>
              Add a new sewing operation with standard minutes and piece rate
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product_type">Product Type</Label>
                <Select
                  value={formData.product_type}
                  onValueChange={value =>
                    setFormData({ ...formData, product_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Operation Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Join shoulders"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="standard_minutes">Standard Minutes (SMV)</Label>
                <Input
                  id="standard_minutes"
                  type="number"
                  step="0.1"
                  value={formData.standard_minutes}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      standard_minutes: e.target.value,
                    })
                  }
                  placeholder="1.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="piece_rate">Piece Rate (â‚±)</Label>
                <Input
                  id="piece_rate"
                  type="number"
                  step="0.01"
                  value={formData.piece_rate}
                  onChange={e =>
                    setFormData({ ...formData, piece_rate: e.target.value })
                  }
                  placeholder="2.25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="depends_on">Dependencies (Optional)</Label>
              <Input
                id="depends_on"
                value={formData.depends_on.join(", ")}
                onChange={e =>
                  setFormData({
                    ...formData,
                    depends_on: e.target.value
                      .split(",")
                      .map(dep => dep.trim())
                      .filter(dep => dep),
                  })
                }
                placeholder="e.g., Join shoulders, Attach collar"
              />
              <p className="text-sm text-muted-foreground">
                Comma-separated list of operations that must be completed first
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOperation}
              disabled={
                !formData.product_type ||
                !formData.name ||
                !formData.standard_minutes
              }
            >
              Create Operation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Operation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Operation</DialogTitle>
            <DialogDescription>
              Update operation details, SMV, and piece rate
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_product_type">Product Type</Label>
                <Select
                  value={formData.product_type}
                  onValueChange={value =>
                    setFormData({ ...formData, product_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_name">Operation Name</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Join shoulders"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_standard_minutes">
                  Standard Minutes (SMV)
                </Label>
                <Input
                  id="edit_standard_minutes"
                  type="number"
                  step="0.1"
                  value={formData.standard_minutes}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      standard_minutes: e.target.value,
                    })
                  }
                  placeholder="1.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_piece_rate">Piece Rate (â‚±)</Label>
                <Input
                  id="edit_piece_rate"
                  type="number"
                  step="0.01"
                  value={formData.piece_rate}
                  onChange={e =>
                    setFormData({ ...formData, piece_rate: e.target.value })
                  }
                  placeholder="2.25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_depends_on">Dependencies (Optional)</Label>
              <Input
                id="edit_depends_on"
                value={formData.depends_on.join(", ")}
                onChange={e =>
                  setFormData({
                    ...formData,
                    depends_on: e.target.value
                      .split(",")
                      .map(dep => dep.trim())
                      .filter(dep => dep),
                  })
                }
                placeholder="e.g., Join shoulders, Attach collar"
              />
              <p className="text-sm text-muted-foreground">
                Comma-separated list of operations that must be completed first
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditOperation}
              disabled={
                !formData.product_type ||
                !formData.name ||
                !formData.standard_minutes
              }
            >
              Update Operation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

