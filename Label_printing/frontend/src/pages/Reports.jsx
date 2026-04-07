import { useState, useEffect, useCallback } from "react";
import { Eye, Printer, Calendar, RefreshCw, Copy, FileText, Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

import * as api from "@/services/api";

// ============================================
// TIME FILTER OPTIONS (Dropdown)
// ============================================
const TIME_FILTERS = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" }
];

// ============================================
// FIELD FILTER OPTIONS (Dropdown)
// ============================================
const FIELD_FILTERS = [
  { key: null, label: "Filter By...", placeholder: "" },
  { key: "product", label: "Product", placeholder: "Search product name..." },
  { key: "capacity", label: "Capacity", placeholder: "Search capacity..." },
  { key: "model", label: "Model No", placeholder: "Search model number..." },
  { key: "serial", label: "Serial No", placeholder: "Search serial number..." },
  { key: "mfgCode", label: "MFG Code", placeholder: "Search manufacturing code..." },
  { key: "ssn", label: "SSN", placeholder: "Search SSN..." }
];

// ============================================
// PAPER CONFIGURATIONS - EXACT COPY FROM PrintPreview.jsx
// ============================================
const PAPER_CONFIGS = {
  A4_SHEET: {
    name: "A4 SHEET",
    pageWidth: "210mm",
    pageHeight: "297mm",
    labelWidth: "71mm",
    labelHeight: "59mm",
    labelsPerRow: 2,
    labelsPerColumn: 4,
    labelsPerPage: 8,
    marginTop: "10mm",
    marginBottom: "10mm",
    marginLeft: "34mm",
    marginRight: "34mm",
    gapHorizontal: "5mm",
    gapVertical: "5mm"
  },
  A3_SHEET: {
    name: "A3+ SHEET",
    pageWidth: "329mm",
    pageHeight: "483mm",
    labelWidth: "71mm",
    labelHeight: "59mm",
    labelsPerRow: 4,
    labelsPerColumn: 6,
    labelsPerPage: 24,
    marginTop: "15mm",
    marginBottom: "15mm",
    marginLeft: "10mm",
    marginRight: "10mm",
    gapHorizontal: "5mm",
    gapVertical: "5mm"
  },
  ROLL_SHEET: {
    name: "ROLL SHEET",
    pageWidth: "86mm",
    pageHeight: "90mm",
    labelWidth: "80mm",
    labelHeight: "80mm",
    labelsPerRow: 1,
    labelsPerColumn: 1,
    labelsPerPage: 1,
    marginTop: "5mm",
    marginBottom: "5mm",
    marginLeft: "3mm",
    marginRight: "3mm",
    gapHorizontal: "0mm",
    gapVertical: "0mm"
  }
};

// ============================================
// LABEL DIMENSIONS - EXACT COPY FROM PrintPreview.jsx
// ============================================
const LABEL_DIMENSIONS = {
  A4_A3: {
    headerHeight: "8mm",
    rowHeight: "5mm",
    madeInHeight: "4mm",
    footerHeight: "17mm",
    keyWidth: "25mm",
    valueWidth: "46mm",
    qrSize: "16mm",
    qrPadding: "5mm",
    qrContainerWidth: "26mm",
    contactWidth: "40mm",
    contactHeight: "13mm",
    contactRightPadding: "5mm"
  },
  ROLL: {
    headerHeight: "11mm",
    rowHeight: "7mm",
    madeInHeight: "7mm",
    footerHeight: "20mm",
    keyWidth: "25mm",
    valueWidth: "55mm",
    qrSize: "19mm",
    qrPadding: "5mm",
    qrContainerWidth: "29mm",
    contactWidth: "49mm",
    contactHeight: "16mm",
    contactRightPadding: "2mm"
  }
};

function Reports() {
  // ============================================
  // FILTER STATE
  // ============================================
  const [timeFilter, setTimeFilter] = useState("all");
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [fieldFilter, setFieldFilter] = useState(null);
  const [fieldDropdownOpen, setFieldDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeSearch, setActiveSearch] = useState({ field: null, value: "" });

  // ============================================
  // DATA STATE
  // ============================================
  const [detailEvent, setDetailEvent] = useState(null);
  const [eventLabels, setEventLabels] = useState([]);
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // ============================================
  // REPRINT FEATURE STATE
  // ============================================
  const [reprintDialog, setReprintDialog] = useState({ open: false, label: null });
  const [reprintCopies, setReprintCopies] = useState(1);
  const [reprintPaperType, setReprintPaperType] = useState("A4_SHEET");
  const [paperDropdownOpen, setPaperDropdownOpen] = useState(false);
  const [isReprinting, setIsReprinting] = useState(false);
  const [companyConfig, setCompanyConfig] = useState(null);

  // Fetch company config for reprint labels
  useEffect(() => {
    async function fetchConfig() {
      try {
        const result = await api.getActiveConfig();
        if (result.success && result.data) {
          setCompanyConfig(result.data);
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    }
    fetchConfig();
  }, []);

  // ============================================
  // FETCH EVENTS - Backend search
  // ============================================
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const result = await api.searchEventsWithLabels(
        timeFilter,
        activeSearch.field,
        activeSearch.value
      );
      if (result.success && result.data) {
        setEvents(result.data);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEventsError(error.message);
    } finally {
      setEventsLoading(false);
    }
  }, [timeFilter, activeSearch]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ============================================
  // FETCH LABELS - With search filtering inside popup
  // ============================================
  useEffect(() => {
    async function fetchEventLabels() {
      if (!detailEvent) {
        setEventLabels([]);
        return;
      }
      
      setLabelsLoading(true);
      try {
        let result;
        
        // If there's an active search, fetch filtered labels
        if (activeSearch.field && activeSearch.value) {
          result = await api.getFilteredLabelsByEvent(
            detailEvent.overall_report_id,
            activeSearch.field,
            activeSearch.value
          );
        } else {
          result = await api.getUniqueReportsByEvent(detailEvent.overall_report_id);
        }
        
        if (result.success && result.data) {
          setEventLabels(result.data);
        } else {
          setEventLabels([]);
        }
      } catch (error) {
        console.error("Failed to fetch event labels:", error);
        toast.error("Failed to load labels");
      } finally {
        setLabelsLoading(false);
      }
    }
    
    fetchEventLabels();
  }, [detailEvent, activeSearch]);

  // ============================================
  // SEARCH HANDLERS
  // ============================================
  
  const handleSearch = () => {
    if (fieldFilter && searchValue.trim()) {
      setActiveSearch({ field: fieldFilter, value: searchValue.trim() });
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setFieldFilter(null);
    setSearchValue("");
    setActiveSearch({ field: null, value: "" });
  };

  const handleTimeFilterChange = (key) => {
    setTimeFilter(key);
    setTimeDropdownOpen(false);
  };

  const handleFieldFilterChange = (key) => {
    setFieldFilter(key);
    setFieldDropdownOpen(false);
    setSearchValue("");
    if (!key) {
      setActiveSearch({ field: null, value: "" });
    }
  };

  // Get current field filter config
  const currentFieldConfig = FIELD_FILTERS.find(f => f.key === fieldFilter);

  // ============================================
  // REPRINT HANDLERS
  // ============================================
  
  const handleReprintClick = (label) => {
    setReprintDialog({ open: true, label });
    setReprintCopies(1);
    setReprintPaperType("A4_SHEET");
    setPaperDropdownOpen(false);
  };

  const closeReprintDialog = () => {
    setReprintDialog({ open: false, label: null });
    setReprintCopies(1);
    setReprintPaperType("A4_SHEET");
    setPaperDropdownOpen(false);
  };

  const handleReprint = async () => {
    const label = reprintDialog.label;
    if (!label) return;

    setIsReprinting(true);

    try {
      await api.markAsReprinted(label.report_id);
      openReprintWindow(label, reprintCopies, reprintPaperType);
      toast.success(`Reprinting ${reprintCopies} copy(ies) of serial ${label.serial_number} on ${PAPER_CONFIGS[reprintPaperType].name}`);
      closeReprintDialog();
    } catch (error) {
      console.error('Reprint error:', error);
      toast.error('Failed to process reprint');
    } finally {
      setIsReprinting(false);
    }
  };

  // ============================================
  // GENERATE PRINT WINDOW - EXACT MATCH WITH PrintPreview.jsx
  // ============================================
  const openReprintWindow = (label, copies, paperType) => {
    const config = PAPER_CONFIGS[paperType];
    const isRoll = paperType === "ROLL_SHEET";
    const dims = isRoll ? LABEL_DIMENSIONS.ROLL : LABEL_DIMENSIONS.A4_A3;
    
    const callAssistantNo = companyConfig?.call_assistant_no || "94421 50005";
    const madeInValue = companyConfig?.made_in_value || "MADE IN INDIA";
    const companyLogo = companyConfig?.company_logo || null;

    const labelFontSize = isRoll ? "3.5mm" : "3mm";
    const madeInFontSize = isRoll ? "4mm" : "3mm";
    const contactFontSize = isRoll ? "4mm" : "3.3mm";
    const phoneFontSize = isRoll ? "4.5mm" : "3.8mm";
    const logoHeight = isRoll ? "10mm" : "7mm";
    const qrSizePx = isRoll ? 72 : 60;

    const logoHtml = companyLogo 
      ? `<img src="${companyLogo}" alt="Logo" style="height: ${logoHeight}; object-fit: contain;" />`
      : `<span style="color: #2563eb; font-weight: bold; font-size: ${isRoll ? '5mm' : '4mm'};">jr</span><span style="color: #374151; font-weight: 600; font-size: ${isRoll ? '5mm' : '4mm'};">tech</span><span style="color: #22c55e; font-weight: 600; font-size: ${isRoll ? '5mm' : '4mm'};">labs</span><span style="color: #9ca3af; font-size: ${isRoll ? '2.5mm' : '2mm'}; margin-left: 1mm;">pvt . ltd</span>`;

    const labels = Array(copies).fill(label);
    const pages = [];
    for (let i = 0; i < labels.length; i += config.labelsPerPage) {
      pages.push(labels.slice(i, i + config.labelsPerPage));
    }

    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reprint Label - ${label.serial_number} - ${config.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; }
          .print-page {
            width: ${config.pageWidth};
            min-height: ${config.pageHeight};
            padding-top: ${config.marginTop};
            padding-bottom: ${config.marginBottom};
            padding-left: ${config.marginLeft};
            padding-right: ${config.marginRight};
            display: grid;
            grid-template-columns: repeat(${config.labelsPerRow}, ${config.labelWidth});
            grid-template-rows: repeat(${config.labelsPerColumn}, ${config.labelHeight});
            column-gap: ${config.gapHorizontal};
            row-gap: ${config.gapVertical};
            page-break-after: always;
          }
          .label-card {
            width: ${config.labelWidth};
            height: ${config.labelHeight};
            border: 1px solid #9ca3af;
            display: flex;
            flex-direction: column;
            background: white;
            page-break-inside: avoid;
            overflow: hidden;
          }
          .label-header {
            height: ${dims.headerHeight};
            display: flex;
            justify-content: center;
            align-items: center;
            border-bottom: 1px solid #e5e5e5;
          }
          .label-row {
            display: flex;
            height: ${dims.rowHeight};
            border-bottom: 1px solid #e5e5e5;
          }
          .label-key {
            width: ${dims.keyWidth};
            background-color: #000;
            color: white;
            padding-left: 1mm;
            font-weight: 700;
            font-size: ${labelFontSize};
            display: flex;
            align-items: center;
          }
          .label-value {
            width: ${dims.valueWidth};
            padding-left: 2mm;
            color: #374151;
            font-weight: 700;
            font-size: ${labelFontSize};
            display: flex;
            align-items: center;
            text-transform: uppercase;
          }
          .label-value.mono { font-family: monospace; }
          .made-in {
            height: ${dims.madeInHeight};
            background-color: #000;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: ${madeInFontSize};
            text-transform: uppercase;
          }
          .label-footer {
            height: ${dims.footerHeight};
            display: flex;
            border-top: 1px solid #d1d5db;
            background: white;
          }
          .qr-section {
            width: ${dims.qrContainerWidth};
            display: flex;
            align-items: center;
            justify-content: center;
            border-right: 1px solid #e5e5e5;
          }
          .qr-section img { width: ${dims.qrSize}; height: ${dims.qrSize}; }
          .contact-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding-right: ${dims.contactRightPadding};
          }
          .contact-text { font-size: ${contactFontSize}; color: #374151; font-weight: 600; }
          .contact-text.light { font-weight: 500; }
          .contact-phone { font-size: ${phoneFontSize}; color: #ff0a0a; font-weight: bold; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-page { page-break-after: always; }
            .label-card { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        ${pages.map(pageLabels => `
          <div class="print-page">
            ${pageLabels.map(lbl => `
              <div class="label-card">
                <div class="label-header">${logoHtml}</div>
                <div class="label-row">
                  <div class="label-key">PRODUCT</div>
                  <div class="label-value">${(lbl.product_name || '').toUpperCase()}</div>
                </div>
                <div class="label-row">
                  <div class="label-key">CAPACITY</div>
                  <div class="label-value">${(lbl.capacity_name || '').toUpperCase()}</div>
                </div>
                <div class="label-row">
                  <div class="label-key">MODEL NO</div>
                  <div class="label-value">${(lbl.model_name || '').toUpperCase()}</div>
                </div>
                <div class="label-row">
                  <div class="label-key">SERIAL NO</div>
                  <div class="label-value mono">${(lbl.serial_number || '').toUpperCase()}</div>
                </div>
                <div class="label-row">
                  <div class="label-key">MFG . CODE</div>
                  <div class="label-value">${(lbl.manufacturing_code || '').toUpperCase()}</div>
                </div>
                <div class="label-row">
                  <div class="label-key">SSN</div>
                  <div class="label-value">${(lbl.ssn || '').toUpperCase()}</div>
                </div>
                <div class="made-in">${madeInValue.toUpperCase()}</div>
                <div class="label-footer">
                  <div class="qr-section">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=${qrSizePx}x${qrSizePx}&data=${encodeURIComponent(lbl.serial_number || 'N/A')}" alt="QR" />
                  </div>
                  <div class="contact-section">
                    <div class="contact-text">For Service Assistance</div>
                    <div class="contact-text light">Please Call</div>
                    <div class="contact-phone">${callAssistantNo}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleRefresh = () => {
    fetchEvents();
    toast.success('Reports refreshed');
  };

  const currentPaperConfig = PAPER_CONFIGS[reprintPaperType];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setTimeDropdownOpen(false);
      setFieldDropdownOpen(false);
    };
    
    if (timeDropdownOpen || fieldDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [timeDropdownOpen, fieldDropdownOpen]);

  if (eventsLoading && events.length === 0) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
        Loading reports...
      </div>
    );
  }

  if (eventsError) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive mb-4">Error: {eventsError}</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="erp-section-label">ANALYTICS</p>
          <h2 className="erp-page-title">PRINT EVENT REPORTS</h2>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw size={14} className={`mr-2 ${eventsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ============================================ */}
      {/* FILTER BAR */}
      {/* ============================================ */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Time Filter Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTimeDropdownOpen(!timeDropdownOpen);
              setFieldDropdownOpen(false);
            }}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white flex items-center gap-2 hover:border-gray-400 transition-colors min-w-[140px]"
          >
            <Calendar size={14} className="text-gray-500" />
            <span className="text-gray-700 font-medium">
              {TIME_FILTERS.find(f => f.key === timeFilter)?.label}
            </span>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ml-auto ${timeDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {timeDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[160px]">
              {TIME_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTimeFilterChange(filter.key);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    timeFilter === filter.key ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Field Filter Dropdown */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFieldDropdownOpen(!fieldDropdownOpen);
              setTimeDropdownOpen(false);
            }}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white flex items-center gap-2 hover:border-gray-400 transition-colors min-w-[140px]"
          >
            <Filter size={14} className="text-gray-500" />
            <span className={`font-medium ${fieldFilter ? 'text-primary' : 'text-gray-500'}`}>
              {currentFieldConfig?.label || "Filter By..."}
            </span>
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ml-auto ${fieldDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {fieldDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[160px]">
              {FIELD_FILTERS.map((filter) => (
                <button
                  key={filter.key || 'none'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFieldFilterChange(filter.key);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    fieldFilter === filter.key ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar - Appears when field is selected */}
        {fieldFilter && (
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={currentFieldConfig?.placeholder || "Search..."}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-9 pr-4 h-9"
                autoFocus
              />
            </div>
            <Button size="sm" onClick={handleSearch} className="h-9">
              <Search size={14} className="mr-1" />
              Search
            </Button>
          </div>
        )}

        {/* Active Search Badge */}
        {activeSearch.field && activeSearch.value && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
            <span className="font-medium">
              {FIELD_FILTERS.find(f => f.key === activeSearch.field)?.label}: "{activeSearch.value}"
            </span>
            <button
              onClick={clearSearch}
              className="hover:bg-primary/20 rounded-full p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      {(activeSearch.field || timeFilter !== 'all') && (
        <div className="mb-4 text-sm text-muted-foreground">
          Found <span className="font-semibold text-foreground">{events.length}</span> event(s)
          {activeSearch.field && activeSearch.value && (
            <span> with matching labels</span>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* EVENTS TABLE */}
      {/* ============================================ */}
      <div className="erp-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="erp-table-header">
              <th className="px-4 py-3 text-left">EVENT NO</th>
              <th className="px-4 py-3 text-left">LABELS PRINTED</th>
              {activeSearch.field && <th className="px-4 py-3 text-left">MATCHES</th>}
              <th className="px-4 py-3 text-left">CREATED</th>
              <th className="px-4 py-3 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {events && events.length > 0 ? (
              events.map((event) => (
                <tr key={event.overall_report_id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{event.event_number}</td>
                  <td className="px-4 py-3">{event.number_of_label_printed}</td>
                  {activeSearch.field && (
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {event.matching_labels || 0}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(event.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7"
                      onClick={() => setDetailEvent(event)}
                    >
                      <Eye size={14} className="mr-1" /> View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={activeSearch.field ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                  No events found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ============================================ */}
      {/* EVENT DETAIL DIALOG */}
      {/* ============================================ */}
      <Dialog open={!!detailEvent} onOpenChange={() => setDetailEvent(null)}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Event {detailEvent?.event_number} Details</DialogTitle>
          </DialogHeader>
          {detailEvent && (
            <div className="overflow-x-auto">
              {labelsLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  <RefreshCw className="animate-spin mx-auto mb-2" size={20} />
                  Loading labels...
                </div>
              ) : eventLabels.length > 0 ? (
                <>
                  {/* Summary info */}
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg text-sm flex flex-wrap items-center gap-4">
                    <div>
                      <span className="text-muted-foreground">Unique Serials: </span>
                      <span className="font-semibold">{eventLabels.length}</span>
                    </div>
                    <span className="text-muted-foreground">|</span>
                    <div>
                      <span className="text-muted-foreground">Total Labels: </span>
                      <span className="font-semibold">{detailEvent.number_of_label_printed}</span>
                    </div>
                    {activeSearch.field && activeSearch.value && (
                      <>
                        <span className="text-muted-foreground">|</span>
                        <div className="text-primary">
                          <span className="font-medium">
                            Filtered by {FIELD_FILTERS.find(f => f.key === activeSearch.field)?.label}: "{activeSearch.value}"
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="erp-table-header">
                        <th className="px-3 py-2 text-left">PRODUCT</th>
                        <th className="px-3 py-2 text-left">CAPACITY</th>
                        <th className="px-3 py-2 text-left">MODEL</th>
                        <th className="px-3 py-2 text-left">SERIAL</th>
                        <th className="px-3 py-2 text-left">MFG CODE</th>
                        <th className="px-3 py-2 text-left">SSN</th>
                        <th className="px-3 py-2 text-center">COPIES</th>
                        <th className="px-3 py-2 text-left">QR</th>
                        <th className="px-3 py-2 text-left">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventLabels.map((label, idx) => (
                        <tr key={label.report_id || idx} className="border-b border-border">
                          <td className="px-3 py-2">{label.product_name}</td>
                          <td className="px-3 py-2">{label.capacity_name}</td>
                          <td className="px-3 py-2">{label.model_name}</td>
                          <td className="px-3 py-2 font-mono text-primary font-semibold">{label.serial_number}</td>
                          <td className="px-3 py-2">{label.manufacturing_code}</td>
                          <td className="px-3 py-2">{label.ssn}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-semibold ${
                              parseInt(label.label_count) > 1 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {label.label_count || 1}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <QRCodeSVG value={label.qr_data || label.serial_number || 'N/A'} size={40} />
                          </td>
                          <td className="px-3 py-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7"
                              onClick={() => handleReprintClick(label)}
                            >
                              <Printer size={12} className="mr-1" /> Reprint
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No labels found for this event
                  {activeSearch.field && activeSearch.value && (
                    <span> matching "{activeSearch.value}"</span>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* REPRINT CONFIRMATION DIALOG */}
      {/* ============================================ */}
      <Dialog open={reprintDialog.open} onOpenChange={closeReprintDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer size={18} />
              Reprint Label
            </DialogTitle>
          </DialogHeader>
          
          {reprintDialog.label && (
            <div className="space-y-4">
              {/* Label Preview Card */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <h4 className="text-xs font-semibold text-muted-foreground mb-3">LABEL PREVIEW</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Product:</span>
                    <p className="font-medium">{reprintDialog.label.product_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <p className="font-medium">{reprintDialog.label.capacity_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <p className="font-medium">{reprintDialog.label.model_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Serial:</span>
                    <p className="font-mono font-semibold text-primary">{reprintDialog.label.serial_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">MFG Code:</span>
                    <p className="font-medium">{reprintDialog.label.manufacturing_code || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SSN:</span>
                    <p className="font-medium">{reprintDialog.label.ssn || '—'}</p>
                  </div>
                </div>
                
                <div className="flex justify-center mt-4 pt-3 border-t">
                  <QRCodeSVG 
                    value={reprintDialog.label.serial_number || 'N/A'} 
                    size={80} 
                  />
                </div>
              </div>

              {/* Paper Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <FileText size={14} />
                  Paper Type
                </label>
                <div className="relative">
                  <button
                    onClick={() => setPaperDropdownOpen(!paperDropdownOpen)}
                    className="w-full px-3 py-2 text-left text-sm border border-gray-300 rounded-md bg-white flex items-center justify-between hover:border-gray-400 transition-colors"
                    disabled={isReprinting}
                  >
                    <span className="text-gray-700 font-medium">{PAPER_CONFIGS[reprintPaperType].name}</span>
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${paperDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {paperDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      {Object.entries(PAPER_CONFIGS).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setReprintPaperType(key);
                            setPaperDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                            reprintPaperType === key ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                          }`}
                        >
                          {config.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                  <span className="font-medium">Dimensions:</span> {currentPaperConfig.labelWidth} × {currentPaperConfig.labelHeight} | 
                  <span className="ml-1">{currentPaperConfig.labelsPerPage} labels/page</span>
                </div>
              </div>

              {/* Number of Copies */}
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Copy size={14} />
                  Number of Copies
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setReprintCopies(Math.max(1, reprintCopies - 1))}
                    disabled={reprintCopies <= 1 || isReprinting}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={reprintCopies}
                    onChange={(e) => setReprintCopies(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center h-9"
                    disabled={isReprinting}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setReprintCopies(Math.min(50, reprintCopies + 1))}
                    disabled={reprintCopies >= 50 || isReprinting}
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This will print {reprintCopies} label{reprintCopies > 1 ? 's' : ''} using the existing serial number.
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                <p className="text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Reprinting reuses the original serial number. 
                  The label will be marked as "reprinted" in the system.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={closeReprintDialog}
                  disabled={isReprinting}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleReprint}
                  disabled={isReprinting}
                >
                  {isReprinting ? (
                    <>
                      <RefreshCw size={14} className="mr-2 animate-spin" />
                      Printing...
                    </>
                  ) : (
                    <>
                      <Printer size={14} className="mr-2" />
                      Print {reprintCopies} {reprintCopies > 1 ? 'Copies' : 'Copy'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Reports;