import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

import { useApi, useMutation } from "@/hooks/useApi";
import * as api from "@/services/api";

const CATEGORIES = [
  {
    key: "products",
    label: "PRODUCTS",
    apiGet: api.getProducts,
    apiCreate: api.createProduct,
    apiUpdate: api.updateProduct,
    apiDelete: api.deleteProduct
  },
  {
    key: "capacities",
    label: "CAPACITIES",
    apiGet: api.getCapacities,
    apiCreate: api.createCapacity,
    apiUpdate: api.updateCapacity,
    apiDelete: api.deleteCapacity
  },
  {
    key: "models",
    label: "MODELS",
    apiGet: api.getModels,
    apiCreate: api.createModel,
    apiUpdate: api.updateModel,
    apiDelete: api.deleteModel
  }
];

function MasterManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("products");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [name, setName] = useState("");
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // ✅ Handle Quick Add navigation state
  // When navigating from TopBar Quick Add menu, state contains:
  // - tab: "products" | "capacities" | "models"
  // - openDialog: true
  useEffect(() => {
    if (location.state) {
      const { tab, openDialog } = location.state;
      
      // Switch to the specified tab
      if (tab && CATEGORIES.find(c => c.key === tab)) {
        setActiveTab(tab);
      }
      
      // Open the add dialog
      if (openDialog) {
        setEditItem(null);
        setName("");
        setDialogOpen(true);
      }
      
      // Clear the state to prevent reopening on refresh
      // Use replace to avoid adding to history
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate, location.pathname]);

  const categoryConfig = CATEGORIES.find((c) => c.key === activeTab);

  // Fetch ALL items (active + inactive) from API
  const { data: items = [], loading: itemsLoading, error: itemsError } = useApi(
    categoryConfig.apiGet,
    [activeTab, refetchTrigger]
  );

  const { mutate: createItem, loading: createLoading } = useMutation(
    (name) => categoryConfig.apiCreate(name)
  );

  const { mutate: updateItem, loading: updateLoading } = useMutation(
    (id, name, isActive) => categoryConfig.apiUpdate(id, name, isActive)
  );

  const { mutate: deleteItem, loading: deleteLoading } = useMutation(
    (id) => categoryConfig.apiDelete(id)
  );

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      if (editItem) {
        // Update existing
        await updateItem(
          editItem.product_id || editItem.capacity_id || editItem.model_id,
          name.trim(),
          editItem.is_active
        );
        toast.success("Updated");
      } else {
        // Create new
        await createItem(name.trim());
        toast.success("Added");
      }

      setDialogOpen(false);
      setName("");
      setEditItem(null);
      setRefetchTrigger((r) => r + 1);
    } catch (err) {
      toast.error(err.message || "Operation failed");
    }
  };

  // TOGGLE: Changes status between ACTIVE ↔ INACTIVE
  // Does NOT remove from table - item stays visible with updated status
  const toggleStatus = async (item) => {
    try {
      const itemId = item.product_id || item.capacity_id || item.model_id;
      const itemName = item.product_name || item.capacity_value || item.model_name;
      
      // Toggle: true → false (Active → Inactive) or false → true (Inactive → Active)
      const newStatus = !item.is_active;

      await updateItem(itemId, itemName, newStatus);
      toast.success(newStatus ? "Item activated" : "Item deactivated");
      setRefetchTrigger((r) => r + 1);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // HARD DELETE: Permanently removes item from database and UI
  const handleDelete = async (item) => {
    const itemName = item.product_name || item.capacity_value || item.model_name;
    
    // Confirm before deleting
    if (!window.confirm(`Are you sure you want to permanently delete "${itemName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const itemId = item.product_id || item.capacity_id || item.model_id;
      
      // HARD DELETE: Actually removes from database
      await deleteItem(itemId);
      toast.success("Item deleted permanently");
      setRefetchTrigger((r) => r + 1);
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setName(item.product_name || item.capacity_value || item.model_name);
    setDialogOpen(true);
  };

  if (itemsLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (itemsError) {
    return (
      <div className="p-6 text-center text-destructive">
        Error: {itemsError}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-primary">DATA MANAGEMENT</p>
          <h2 className="text-3xl font-bold text-foreground">MASTER RECORDS</h2>
        </div>
        <Button
          onClick={() => {
            setEditItem(null);
            setName("");
            setDialogOpen(true);
          }}
          disabled={createLoading}
        >
          <Plus size={16} className="mr-2" /> ADD NEW
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`px-4 py-2 text-xs font-bold tracking-wider rounded-md transition-colors ${
              activeTab === cat.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Data Table - Shows ALL items (active + inactive) */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">NAME</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">STATUS</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {items && items.length > 0 ? (
              items.map((item, idx) => (
                <tr
                  key={item.product_id || item.capacity_id || item.model_id}
                  className={`border-b border-border hover:bg-muted/30 transition-colors ${
                    !item.is_active ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {item.product_name || item.capacity_value || item.model_name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                        item.is_active
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {item.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => openEdit(item)}
                        disabled={updateLoading}
                        title="Edit item"
                      >
                        <Edit2 size={14} />
                      </Button>
                      {/* TOGGLE: Changes status (ACTIVE ↔ INACTIVE) */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => toggleStatus(item)}
                        disabled={updateLoading}
                        title={item.is_active ? "Click to deactivate" : "Click to activate"}
                      >
                        {item.is_active ? (
                          <ToggleRight size={14} />
                        ) : (
                          <ToggleLeft size={14} />
                        )}
                      </Button>
                      {/* DELETE: Permanently removes from database */}
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => handleDelete(item)}
                        disabled={deleteLoading}
                        title="Delete permanently"
                      >
                        <Trash2 size={14} />
                      </Button> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit" : "Add"} {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              disabled={createLoading || updateLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={createLoading || updateLoading}
            >
              {createLoading || updateLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MasterManagement;