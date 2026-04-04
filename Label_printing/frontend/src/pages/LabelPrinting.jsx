import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, Download, Plus, Trash2, Eye, Check, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Import API and hooks
import { useApi } from "@/hooks/useApi";
import * as api from "@/services/api";

// ============================================
// CONSTANTS
// ============================================
const DRAFT_STORAGE_KEY = "labelPrinting_draft";

// ============================================
// LAZY SERIAL GENERATION
// Serial numbers are NOT generated on row creation
// They are generated ONLY when user clicks "PRINT LABELS"
// ============================================
function createEmptyRow(lNo) {
  return {
    id: crypto.randomUUID(),
    lNo,
    product: "",
    productId: null,
    capacity: "",
    capacityId: null,
    model: "",
    modelId: null,
    serialNo: "",      // Empty - will be generated at print time
    serialId: null,    // Null - will be generated at print time
    mfgCode: "",
    ssn: "",
    qty: 1,
    dupCount: 1
  };
}

function LabelPrintingPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRow, setPreviewRow] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Track if we should save to localStorage (avoid saving on initial load)
  const isInitialized = useRef(false);

  // Fetch master data from API - ACTIVE items only for dropdowns
  const { data: products = [], loading: productsLoading } = useApi(api.getActiveProducts);
  const { data: capacities = [], loading: capacitiesLoading } = useApi(api.getActiveCapacities);
  const { data: models = [], loading: modelsLoading } = useApi(api.getActiveModels);

  // ============================================
  // DRAFT PERSISTENCE - Load from localStorage
  // ============================================
  useEffect(() => {
    function loadDraft() {
      setInitialLoading(true);
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Restore saved rows (without serial numbers - they'll be generated at print)
            setRows(parsed.map((row, index) => ({
              ...row,
              lNo: index + 1,
              // Clear any old serial data to ensure fresh generation
              serialNo: "",
              serialId: null
            })));
            toast.success(`Draft restored: ${parsed.length} row(s)`);
          } else {
            // No valid draft, start with empty row
            setRows([createEmptyRow(1)]);
          }
        } else {
          // No draft found, start with empty row
          setRows([createEmptyRow(1)]);
        }
      } catch (error) {
        console.error("Error loading draft:", error);
        setRows([createEmptyRow(1)]);
      }
      setInitialLoading(false);
      isInitialized.current = true;
    }

    loadDraft();
  }, []);

  // ============================================
  // DRAFT PERSISTENCE - Save to localStorage on changes
  // ============================================
  useEffect(() => {
    if (!isInitialized.current) return; // Don't save during initial load
    
    try {
      // Save rows without serial data (serials are generated at print time)
      const dataToSave = rows.map(row => ({
        id: row.id,
        lNo: row.lNo,
        product: row.product,
        productId: row.productId,
        capacity: row.capacity,
        capacityId: row.capacityId,
        model: row.model,
        modelId: row.modelId,
        mfgCode: row.mfgCode,
        ssn: row.ssn,
        qty: row.qty,
        dupCount: row.dupCount
        // Note: serialNo and serialId are NOT saved
      }));
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  }, [rows]);

  // ============================================
  // Clear Draft function
  // ============================================
  const clearDraft = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all rows? This cannot be undone.")) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setRows([createEmptyRow(1)]);
      toast.success("Draft cleared");
    }
  }, []);

  const updateRow = useCallback((id, updates) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, ...updates } : r));
  }, []);

  // Update product with both name and ID
  const handleProductChange = useCallback((rowId, productName) => {
    const product = products.find(p => p.product_name === productName);
    updateRow(rowId, { 
      product: productName,
      productId: product?.product_id || null
    });
  }, [products, updateRow]);

  // Update capacity with both value and ID
  const handleCapacityChange = useCallback((rowId, capacityValue) => {
    const capacity = capacities.find(c => c.capacity_value === capacityValue);
    updateRow(rowId, { 
      capacity: capacityValue,
      capacityId: capacity?.capacity_id || null
    });
  }, [capacities, updateRow]);

  // Update model with both name and ID
  const handleModelChange = useCallback((rowId, modelName) => {
    const model = models.find(m => m.model_name === modelName);
    updateRow(rowId, { 
      model: modelName,
      modelId: model?.model_id || null
    });
  }, [models, updateRow]);

  // ============================================
  // Add row WITHOUT generating serial
  // ============================================
  const addRowAtBottom = useCallback(() => {
    setRows((prev) => {
      const newRow = createEmptyRow(prev.length + 1);
      return [...prev, newRow];
    });
  }, []);

  // ============================================
  // Apply Qty WITHOUT generating serials
  // Just duplicates the row data - serials generated at print time
  // ============================================
  const applyQty = useCallback((rowId) => {
    setRows((prev) => {
      const row = prev.find(r => r.id === rowId);
      if (!row) {
        toast.error("Row not found");
        return prev;
      }

      const qty = row.qty || 1;
      if (qty <= 1) {
        toast.info("Qty must be greater than 1 to apply");
        return prev;
      }

      // Create (qty - 1) new rows with same data (no serials yet)
      const newRows = [];
      for (let i = 0; i < qty - 1; i++) {
        newRows.push({
          ...row,
          id: crypto.randomUUID(),
          lNo: 0,
          serialNo: "",
          serialId: null,
          qty: 1
        });
      }

      // Reset qty of original row
      const updatedRows = prev.map(r => 
        r.id === rowId ? { ...r, qty: 1 } : r
      );

      // Add new rows and renumber
      const allRows = [...updatedRows, ...newRows];
      toast.success(`${newRows.length} row(s) added`);
      return allRows.map((r, i) => ({ ...r, lNo: i + 1 }));
    });
  }, []);

  const deleteRow = useCallback((id) => {
    setRows((prev) => {
      if (prev.length <= 1) {
        toast.error("Cannot delete last row");
        return prev;
      }
      return prev.filter((r) => r.id !== id).map((r, i) => ({ ...r, lNo: i + 1 }));
    });
  }, []);

  // Validate rows (check required fields, but NOT serial - it will be generated)
  const validateRows = () => {
    return rows.filter((r) => 
      r.product && r.productId &&
      r.capacity && r.capacityId &&
      r.model && r.modelId &&
      r.mfgCode && r.ssn
    );
  };

  // Calculate total labels (considering dupCount for each row)
  const totalLabels = rows.reduce((acc, r) => acc + (r.dupCount || 1), 0);

  // ============================================
  // Generate serials ONLY at print time
  // ✅ UPDATED: Don't clear draft here - let PrintPreview handle it
  // ============================================
  const handlePrintLabels = async () => {
    const valid = validateRows();
    if (valid.length === 0) {
      toast.error("No valid rows. Fill all required fields (Product, Capacity, Model, MFG Code, SSN).");
      return;
    }

    setIsPrinting(true);
    
    try {
      // Count how many unique serials we need (one per row, not per dupCount)
      const serialCount = valid.length;
      
      toast.info(`Generating ${serialCount} serial number(s)...`);
      
      // Generate all serials in one batch transaction
      const result = await api.batchGenerateSerialNumbers(serialCount);
      
      if (!result.success || !result.data || result.data.length !== serialCount) {
        toast.error("Failed to generate serial numbers. Please try again.");
        setIsPrinting(false);
        return;
      }

      // Assign serials to valid rows
      const serialsData = result.data;
      const labelsWithSerials = valid.map((row, index) => ({
        // Display data
        product: row.product,
        capacity: row.capacity,
        model: row.model,
        serialNo: serialsData[index].serial_number,
        mfgCode: row.mfgCode,
        ssn: row.ssn,
        dupCount: row.dupCount,
        // IDs for database
        productId: row.productId,
        capacityId: row.capacityId,
        modelId: row.modelId,
        serialId: serialsData[index].serial_id
      }));

      // ✅ CHANGED: Do NOT clear draft here!
      // Draft will be cleared ONLY after successful print in PrintPreview
      // This allows user to cancel and come back to their data
      
      // Navigate to print preview with labels data
      navigate('/print-preview', { 
        state: { 
          labels: labelsWithSerials,
          fromLabelPrinting: true  // Flag to know we came from label printing
        } 
      });

      toast.success(`${serialCount} serial(s) generated successfully!`);
      
    } catch (error) {
      console.error("Error generating serials:", error);
      toast.error("Failed to generate serial numbers. Please try again.");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = () => {
    const valid = validateRows();
    if (valid.length === 0) {
      toast.error("No valid rows");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Label Data Export (Draft)", 14, 20);
    doc.setFontSize(10);
    doc.text("Note: Serial numbers will be generated at print time", 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [["L.No", "Product", "Capacity", "Model", "Serial", "MFG Code", "SSN", "Dup"]],
      body: valid.map((r) => [r.lNo, r.product, r.capacity, r.model, "(Auto)", r.mfgCode, r.ssn, r.dupCount])
    });

    doc.save("label-draft.pdf");
    toast.success("PDF downloaded");
  };

  if (initialLoading || productsLoading || capacitiesLoading || modelsLoading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="erp-section-label">Printing Arena</p>
          <h2 className="erp-page-title">LABEL DATA ENTRY GRID</h2>
          
        </div>
        <div className="flex gap-2">
          {/* Clear Draft Button */}
          <Button 
            variant="outline" 
            onClick={clearDraft}
            className="text-destructive hover:text-destructive"
            title="Clear all rows and draft"
          >
            <RotateCcw size={16} className="mr-2" /> Clear
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download size={16} className="mr-2" /> PDF
          </Button>
          <Button 
            onClick={handlePrintLabels}
            disabled={isPrinting}
          >
            {isPrinting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Printer size={16} className="mr-2" /> PRINT LABELS
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="erp-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="erp-table-header">
              <th className="px-3 py-3 text-left w-14">L.NO</th>
              <th className="px-3 py-3 text-left w-36">PRODUCT</th>
              <th className="px-3 py-3 text-left w-28">CAPACITY</th>
              <th className="px-3 py-3 text-left w-28">MODEL NO</th>
              <th className="px-3 py-3 text-left w-24">SERIAL NO</th>
              <th className="px-3 py-3 text-left w-20">MFG CODE</th>
              <th className="px-3 py-3 text-left w-16">SSN</th>
              <th className="px-3 py-3 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 font-mono text-muted-foreground">{String(row.lNo).padStart(2, "0")}</td>
                <td className="px-3 py-2">
                  <Select value={row.product} onValueChange={(v) => handleProductChange(row.id, v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {products && products.length > 0 ? (
                        products.map((p) => (
                          <SelectItem key={p.product_id} value={p.product_name}>
                            {p.product_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>No products available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <Select value={row.capacity} onValueChange={(v) => handleCapacityChange(row.id, v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {capacities && capacities.length > 0 ? (
                        capacities.map((c) => (
                          <SelectItem key={c.capacity_id} value={c.capacity_value}>
                            {c.capacity_value}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>No capacities available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <Select value={row.model} onValueChange={(v) => handleModelChange(row.id, v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {models && models.length > 0 ? (
                        models.map((m) => (
                          <SelectItem key={m.model_id} value={m.model_name}>
                            {m.model_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-data" disabled>No models available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2">
                  {/* Show "AUTO" placeholder instead of actual serial */}
                  <span className="font-mono text-xs text-muted-foreground italic bg-muted px-2 py-1 rounded">
                    AUTO
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Input 
                    className="h-8 text-xs w-20" 
                    value={row.mfgCode} 
                    onChange={(e) => updateRow(row.id, { mfgCode: e.target.value })} 
                    placeholder="MFG Code"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input 
                    className="h-8 text-xs w-16" 
                    value={row.ssn} 
                    onChange={(e) => updateRow(row.id, { ssn: e.target.value })} 
                    placeholder="SSN"
                  />
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {/* Qty Input */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">Qty</span>
                      <Input 
                        className="h-7 w-12 text-xs text-center" 
                        type="number" 
                        min={1} 
                        value={row.qty} 
                        onChange={(e) => updateRow(row.id, { qty: parseInt(e.target.value) || 1 })} 
                      />
                    </div>
                    {/* Dup Input */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">Dup</span>
                      <Input 
                        className="h-7 w-12 text-xs text-center" 
                        type="number" 
                        min={1} 
                        value={row.dupCount} 
                        onChange={(e) => updateRow(row.id, { dupCount: parseInt(e.target.value) || 1 })} 
                      />
                    </div>
                    {/* Apply Button - No longer generates serials */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 text-xs"
                      onClick={() => applyQty(row.id)}
                    >
                      <Check size={12} className="mr-1" /> Apply
                    </Button>
                    {/* Preview Button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0" 
                      onClick={() => {
                        setPreviewRow(row);
                        setPreviewOpen(true);
                      }}
                    >
                      <Eye size={14} />
                    </Button>
                    {/* Add Row Button - No longer generates serials */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0" 
                      onClick={addRowAtBottom}
                    >
                      <Plus size={14} />
                    </Button>
                    {/* Delete Button - No serial wasted! */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 text-destructive" 
                      onClick={() => deleteRow(row.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Footer with row count and total labels */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs">
          <span className="erp-section-label">
            {rows.length} ROW{rows.length !== 1 ? "S" : ""} • DRAFT SAVED
          </span>
          <span className="text-muted-foreground font-mono">
            Total labels to print: {totalLabels}
          </span>
        </div>
      </div>

      

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Label Preview (Draft)</DialogTitle>
          </DialogHeader>
          {previewRow && (
            <div className="space-y-4">
              <div className="erp-card p-4 space-y-2 text-sm">
                <p><span className="text-muted-foreground">Product:</span> {previewRow.product || "—"}</p>
                <p><span className="text-muted-foreground">Capacity:</span> {previewRow.capacity || "—"}</p>
                <p><span className="text-muted-foreground">Model:</span> {previewRow.model || "—"}</p>
                <p><span className="text-muted-foreground">Serial:</span> <span className="font-mono text-muted-foreground italic">(Generated at print)</span></p>
                <p><span className="text-muted-foreground">MFG Code:</span> {previewRow.mfgCode || "—"}</p>
                <p><span className="text-muted-foreground">SSN:</span> {previewRow.ssn || "—"}</p>
                <p><span className="text-muted-foreground">Duplicate Count:</span> {previewRow.dupCount || 1}</p>
              </div>
              <div className="flex justify-center text-center">
                <div className="text-muted-foreground text-xs">
                  <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center">
                    QR Code
                  </div>
                  <p className="mt-2">Generated at print time</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LabelPrintingPage;