import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Printer, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import * as api from "@/services/api";

// ============================================
// HELPER: Generate Event Number
// Note: Using string methods to avoid Tailwind CSS scanner issue with regex
// ============================================
function generateEventNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `EVT-${year}${month}${day}${hours}${minutes}${seconds}`;
}

// ============================================
// CONSTANTS - Must match LabelPrinting.jsx
// ============================================
const DRAFT_STORAGE_KEY = "labelPrinting_draft";

// ============================================
// PAPER CONFIGURATIONS - CORRECTED DIMENSIONS
// ============================================
// A4 = 210mm × 297mm
// 
// WIDTH CALCULATION (2 labels per row):
//   Left Margin + Label1 + Gap + Label2 + Right Margin = 210mm
//   31.5mm + 71mm + 5mm + 71mm + 31.5mm = 210mm ✓
//
// HEIGHT CALCULATION (4 labels per column):
//   Top Margin + (Label × 4) + (Gap × 3) + Bottom Margin = 297mm
//   18.5mm + (59mm × 4) + (5mm × 3) + 15.5mm = 285mm
//   Extra space: 297mm - 285mm = 12mm (distributed to margins)
// ============================================
const PAPER_CONFIGS = {
  A4_SHEET: {
    name: "A4 SHEET",
    pageWidth: "210mm",
    pageHeight: "297mm",
    labelWidth: "71mm",      // 7.1cm
    labelHeight: "59mm",     // 5.9cm
    labelsPerRow: 2,
    labelsPerColumn: 4,
    labelsPerPage: 8,
    marginTop: "18.5mm",
    marginBottom: "15.5mm",
    marginLeft: "31.5mm",
    marginRight: "31.5mm",
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
// LABEL DIMENSIONS - FROM REFERENCE IMAGES
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

// ============================================
// LABEL COMPONENT - EXACT DIMENSIONS
// ============================================
function LabelCard({ label, paperType, companyConfig }) {
  const config = PAPER_CONFIGS[paperType];
  const isRoll = paperType === "ROLL_SHEET";
  const dims = isRoll ? LABEL_DIMENSIONS.ROLL : LABEL_DIMENSIONS.A4_A3;
  
  // Company config values
  const callAssistantNo = companyConfig?.call_assistant_no || "99999 99999";
  const madeInValue = companyConfig?.made_in_value || "MADE IN Trichy";
  const companyLogo = companyConfig?.company_logo || null;

  // Font sizes adjusted for mm dimensions
  const labelFontSize = isRoll ? "3.5mm" : "3mm";
  const madeInFontSize = isRoll ? "4mm" : "3mm";
  const contactFontSize = isRoll ? "4mm" : "3.3mm";
  const phoneFontSize = isRoll ? "4.5mm" : "3.8mm";

  // QR size in pixels (approximate: 1mm ≈ 3.78px at 96dpi)
  const qrSizePx = isRoll ? 72 : 60;

  return (
    <div 
      className="label-card bg-white flex flex-col overflow-hidden"
      style={{
        width: config.labelWidth,
        height: config.labelHeight,
        border: "1px solid #9ca3af",
        boxSizing: "border-box",
        pageBreakInside: "avoid"
      }}
    >
      {/* Header with Logo */}
      <div 
        style={{ 
          height: isRoll ? "10mm" : "8mm",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderBottom: "1px solid #e5e5e5",
          overflow: "hidden"
        }}
      >
        {companyLogo ? (
          <img 
            src={companyLogo} 
            alt="Logo" 
            style={{ 
              height: "100%",
              width: "100%",
              objectFit: "contain"
            }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ color: "#2563eb", fontWeight: "bold", fontSize: isRoll ? "5mm" : "4mm" }}>jr</span>
            <span style={{ color: "#374151", fontWeight: "600", fontSize: isRoll ? "5mm" : "4mm" }}>tech</span>
            <span style={{ color: "#22c55e", fontWeight: "600", fontSize: isRoll ? "5mm" : "4mm" }}>labs</span>
            <span style={{ color: "#9ca3af", fontSize: isRoll ? "2.5mm" : "2mm", marginLeft: "1mm" }}>pvt. ltd</span>
          </div>
        )}
      </div>

      {/* Main Content - 6 rows */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* PRODUCT */}
        <div style={{ display: "flex", height: dims.rowHeight, borderBottom: "1px solid #e5e5e5" }}>
          <div style={{ 
            width: dims.keyWidth, 
            backgroundColor: "#000", 
            color: "white", 
            paddingLeft: "1mm",
            fontWeight: "700",
            fontSize: labelFontSize,
            display: "flex",
            alignItems: "center"
          }}>PRODUCT</div>
          <div style={{ 
            width: dims.valueWidth, 
            paddingLeft: "2mm",
            color: "#374151",
            fontWeight: "700",
            fontSize: labelFontSize,
            display: "flex",
            alignItems: "center",
            textTransform: "uppercase"
          }}>{label.product || ""}</div>
        </div>
        
        {/* CAPACITY */}
        <div style={{ display: "flex", height: dims.rowHeight, borderBottom: "1px solid #e5e5e5" }}>
          <div style={{ 
            width: dims.keyWidth, 
            backgroundColor: "#000", 
            color: "white", 
            paddingLeft: "1mm",
            fontWeight: "700",
            fontSize: labelFontSize,
            display: "flex",
            alignItems: "center"
          }}>CAPACITY</div>
          <div style={{ 
            width: dims.valueWidth, 
            paddingLeft: "2mm",
            color: "#374151",
            fontWeight: "700",
            fontSize: labelFontSize,
            display: "flex",
            alignItems: "center",
            textTransform: "uppercase"
          }}>{label.capacity || ""}</div>
        </div>
        
        {/* MODEL NO */}
        <div style={{ display: "flex", height: dims.rowHeight, borderBottom: "1px solid #e5e5e5" }}>
          <div style={{ 
            width: dims.keyWidth, 
            backgroundColor: "#000", 
            color: "white", 
            paddingLeft: "1mm",
            fontWeight: "700",
            fontSize: labelFontSize,
            display: "flex",
            alignItems: "center"
          }}>MODEL NO</div>
          <div style={{ 
            width: dims.valueWidth, 
            paddingLeft: "2mm",
            color: "#374151",
            fontWeight: "700",
            fontSize: labelFontSize,
            display: "flex",
            alignItems: "center",
            textTransform: "uppercase"
          }}>{label.model || ""}</div>
        </div>
        
        {/* SERIAL NO */}
        <div style={{ display: "flex", height: dims.rowHeight, borderBottom: "1px solid #e5e5e5" }}>
          <div style={{ 
            width: dims.keyWidth, 
            backgroundColor: "#000", 
            color: "white", 
            paddingLeft: "1mm",
            fontWeight: "700",
            fontSize: labelFontSize,
            display: "flex",
            alignItems: "center"
          }}>SERIAL NO</div>
          <div style={{ 
            width: dims.valueWidth, 
            paddingLeft: "2mm",
            color: "#374151",
            fontWeight: "700",
            fontSize: labelFontSize,
            display: "flex",
            alignItems: "center",
            textTransform: "uppercase"
          }}>{label.serialNo || ""}</div>
        </div>
        
        {/* MFG CODE */}
        <div style={{ display: "flex", height: dims.rowHeight, borderBottom: "1px solid #e5e5e5" }}>
          <div style={{ 
            width: dims.keyWidth, 
            backgroundColor: "#000", 
            color: "white", 
            paddingLeft: "1mm",
            fontWeight: "700",
            fontSize: labelFontSize,
            display: "flex",
            alignItems: "center"
          }}>MFG . CODE</div>
          <div style={{ 
            width: dims.valueWidth, 
            paddingLeft: "2mm",
            color: "#374151",
            fontWeight: "700",
            fontSize: labelFontSize,
            display: "flex",
            alignItems: "center",
            textTransform: "uppercase"
          }}>{label.mfgCode || ""}</div>
        </div>
        
        {/* BATCH NO / SSN */}
        <div style={{ display: "flex", height: dims.rowHeight, borderBottom: "1px solid #e5e5e5" }}>
          <div style={{ 
            width: dims.keyWidth, 
            backgroundColor: "#000", 
            color: "white", 
            paddingLeft: "1mm",
            fontWeight: "700",
            fontSize: labelFontSize,
            display: "flex",
            alignItems: "center"
          }}>BATCH NO</div>
          <div style={{ 
            width: dims.valueWidth, 
            paddingLeft: "2mm",
            color: "#374151",
            fontWeight: "700",
            fontSize: labelFontSize,
            display: "flex",
            alignItems: "center",
            textTransform: "uppercase"
          }}>{label.ssn || ""}</div>
        </div>
      </div>

      {/* Made In Bar */}
      <div 
        style={{ 
          height: dims.madeInHeight,
          backgroundColor: "#000",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "700",
          fontSize: madeInFontSize,
          textTransform: "uppercase"
        }}
      >
        {madeInValue}
      </div>

      {/* Footer - QR + Contact */}
      <div 
        style={{ 
          height: dims.footerHeight,
          display: "flex",
          borderTop: "1px solid #d1d5db",
          background: "white"
        }}
      >
        {/* QR Code */}
        <div 
          style={{ 
            width: dims.qrContainerWidth,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRight: "1px solid #e5e5e5"
          }}
        >
          <QRCodeSVG 
            value={label.serialNo || "N/A"} 
            size={qrSizePx}
            level="M"
          />
        </div>
        
        {/* Contact Info */}
        <div 
          style={{ 
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            paddingRight: dims.contactRightPadding
          }}
        >
          <div style={{ fontSize: contactFontSize, color: "#374151", fontWeight: "600" }}>
            For Service Assistance
          </div>
          <div style={{ fontSize: contactFontSize, color: "#374151", fontWeight: "500" }}>
            Please Call
          </div>
          <div style={{ fontSize: phoneFontSize, color: "#ff0a0a", fontWeight: "bold" }}>
            {callAssistantNo}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PRINT PAGE COMPONENT
// ============================================
function PrintPage({ labels, paperType, pageIndex, companyConfig }) {
  const config = PAPER_CONFIGS[paperType];
  
  return (
    <div 
      className="print-page bg-white shadow-lg mb-6"
      style={{
        width: config.pageWidth,
        minHeight: config.pageHeight,
        paddingTop: config.marginTop,
        paddingBottom: config.marginBottom,
        paddingLeft: config.marginLeft,
        paddingRight: config.marginRight,
        display: "grid",
        gridTemplateColumns: `repeat(${config.labelsPerRow}, ${config.labelWidth})`,
        gridTemplateRows: `repeat(${config.labelsPerColumn}, ${config.labelHeight})`,
        columnGap: config.gapHorizontal,
        rowGap: config.gapVertical,
        boxSizing: "border-box"
      }}
    >
      {labels.map((label, idx) => (
        <LabelCard 
          key={`page-${pageIndex}-label-${idx}`}
          label={label}
          paperType={paperType}
          companyConfig={companyConfig}
        />
      ))}
    </div>
  );
}

// ============================================
// MAIN PRINT PREVIEW COMPONENT
// ============================================
function PrintPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [paperType, setPaperType] = useState("A4_SHEET");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [companyConfig, setCompanyConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Get labels from navigation state
  const labelsData = location.state?.labels || [];

  // Fetch company config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const result = await api.getActiveConfig();
        if (result.success && result.data) {
          setCompanyConfig(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch company config:", error);
      } finally {
        setConfigLoading(false);
      }
    }
    fetchConfig();
  }, []);

  // Expand labels by dupCount
  const expandedLabels = useMemo(() => {
    const result = [];
    labelsData.forEach(label => {
      const count = label.dupCount || 1;
      for (let i = 0; i < count; i++) {
        result.push({ ...label });
      }
    });
    return result;
  }, [labelsData]);

  // Get unique serial IDs for voiding on cancel
  const uniqueSerialIds = useMemo(() => {
    const ids = new Set();
    labelsData.forEach(label => {
      if (label.serialId) {
        ids.add(label.serialId);
      }
    });
    return Array.from(ids);
  }, [labelsData]);

  // Group labels into pages
  const pages = useMemo(() => {
    const config = PAPER_CONFIGS[paperType];
    const result = [];
    const labelsPerPage = config.labelsPerPage;
    
    for (let i = 0; i < expandedLabels.length; i += labelsPerPage) {
      result.push(expandedLabels.slice(i, i + labelsPerPage));
    }
    
    return result;
  }, [expandedLabels, paperType]);

  // ============================================
  // PRINT FUNCTION - WITH CORRECT @PAGE RULES
  // ============================================
  const handlePrint = async () => {
    setIsPrinting(true);

    const config = PAPER_CONFIGS[paperType];
    const isRoll = paperType === "ROLL_SHEET";
    const dims = isRoll ? LABEL_DIMENSIONS.ROLL : LABEL_DIMENSIONS.A4_A3;

    // Get company config values
    const companyLogo = companyConfig?.company_logo || null;
    const callAssistantNo = companyConfig?.call_assistant_no || "99999 99999";
    const madeInValue = companyConfig?.made_in_value || "MADE IN Trichy";

    // Font sizes
    const labelFontSize = isRoll ? "3.5mm" : "3mm";
    const madeInFontSize = isRoll ? "4mm" : "3mm";
    const contactFontSize = isRoll ? "4mm" : "3.3mm";
    const phoneFontSize = isRoll ? "4.5mm" : "3.8mm";
    const logoHeight = isRoll ? "10mm" : "8mm";
    
    // QR size
    const qrSizePx = isRoll ? 72 : 60;

    // Save print event to database
    try {
      const eventNumber = generateEventNumber();
      
      // Create overall event report
      const eventResult = await api.createEventReport(eventNumber, expandedLabels.length);
      
      if (eventResult.success && eventResult.data) {
        const eventId = eventResult.data.overall_report_id;
        
        // Track which serial IDs we've already saved to avoid duplicates
        const processedSerialIds = new Set();
        
        // Create report entries with duplicate handling
        for (const label of expandedLabels) {
          try {
            // Create report entry (UPSERT - will increment duplicate_count if exists)
            await api.createReport(
              eventId,
              label.product || '',
              label.capacity || '',
              label.model || '',
              label.serialNo || '',
              label.mfgCode || '',
              label.ssn || '',
              label.serialNo || ''  // QR data
            );
          } catch (reportError) {
            console.error('Failed to save report:', label.serialNo, reportError);
          }

          // Save to Label table ONCE per unique serialId
          if (label.serialId && !processedSerialIds.has(label.serialId)) {
            processedSerialIds.add(label.serialId);
            
            try {
              await api.createLabel(
                label.productId,
                label.capacityId,
                label.modelId,
                label.serialId,
                label.mfgCode || '',
                label.ssn || '',
                label.serialNo || '',
                null,
                companyConfig?.config_id || null,
                label.dupCount || 1
              );
            } catch (labelError) {
              console.error('Failed to save label:', label.serialNo, labelError);
            }
          }
        }
        
        toast.success(`Print saved: ${processedSerialIds.size} label(s)`);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save print event:', error);
      toast.error('Failed to save print data, but continuing with print...');
    } finally {
      setIsPrinting(false);
    }

    // Build logo HTML
    const logoHtml = companyLogo 
      ? `<img src="${companyLogo}" alt="Logo" style="height: ${logoHeight}; width: 100%; object-fit: contain;" />`
      : `<span style="color: #2563eb; font-weight: bold; font-size: ${isRoll ? '5mm' : '4mm'};">jr</span><span style="color: #374151; font-weight: 600; font-size: ${isRoll ? '5mm' : '4mm'};">tech</span><span style="color: #22c55e; font-weight: 600; font-size: ${isRoll ? '5mm' : '4mm'};">labs</span><span style="color: #9ca3af; font-size: ${isRoll ? '2.5mm' : '2mm'}; margin-left: 1mm;">pvt . ltd</span>`;

    const printWindow = window.open('', '_blank');
    
    // ============================================
    // CRITICAL: @page rule for exact dimensions
    // ============================================
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Labels - ${config.name}</title>
        <style>
          /* ============================================
             @PAGE RULE - CRITICAL FOR EXACT DIMENSIONS
             This tells the browser/printer the exact page size
             and that we're handling our own margins
             ============================================ */
          @page {
            size: ${config.pageWidth} ${config.pageHeight};
            margin: 0;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            width: ${config.pageWidth};
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .print-page {
            width: ${config.pageWidth};
            height: ${config.pageHeight};
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
            box-sizing: border-box;
          }
          
          .print-page:last-child {
            page-break-after: auto;
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
            box-sizing: border-box;
          }
          
          .label-header {
            height: ${dims.headerHeight};
            display: flex;
            justify-content: center;
            align-items: center;
            border-bottom: 1px solid #e5e5e5;
            overflow: hidden;
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
          
          .qr-section img {
            width: ${dims.qrSize};
            height: ${dims.qrSize};
          }
          
          .contact-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding-right: ${dims.contactRightPadding};
          }
          
          .contact-text {
            font-size: ${contactFontSize};
            color: #374151;
            font-weight: 600;
          }
          
          .contact-text.light {
            font-weight: 500;
          }
          
          .contact-phone {
            font-size: ${phoneFontSize};
            color: #ff0a0a;
            font-weight: bold;
          }
          
          @media print {
            html, body {
              width: ${config.pageWidth};
              height: ${config.pageHeight};
            }
            .print-page {
              page-break-after: always;
            }
            .label-card {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${pages.map(pageLabels => `
          <div class="print-page">
            ${pageLabels.map(label => `
              <div class="label-card">
                <div class="label-header">
                  ${logoHtml}
                </div>
                <div class="label-row">
                  <div class="label-key">PRODUCT</div>
                  <div class="label-value">${(label.product || '').toUpperCase()}</div>
                </div>
                <div class="label-row">
                  <div class="label-key">CAPACITY</div>
                  <div class="label-value">${(label.capacity || '').toUpperCase()}</div>
                </div>
                <div class="label-row">
                  <div class="label-key">MODEL NO</div>
                  <div class="label-value">${(label.model || '').toUpperCase()}</div>
                </div>
                <div class="label-row">
                  <div class="label-key">SERIAL NO</div>
                  <div class="label-value">${(label.serialNo || '').toUpperCase()}</div>
                </div>
                <div class="label-row">
                  <div class="label-key">MFG . CODE</div>
                  <div class="label-value">${(label.mfgCode || '').toUpperCase()}</div>
                </div>
                <div class="label-row">
                  <div class="label-key">BATCH NO</div>
                  <div class="label-value">${(label.ssn || '').toUpperCase()}</div>
                </div>
                <div class="made-in">${madeInValue.toUpperCase()}</div>
                <div class="label-footer">
                  <div class="qr-section">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=${qrSizePx}x${qrSizePx}&data=${encodeURIComponent(label.serialNo || 'N/A')}" alt="QR" />
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
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // ============================================
  // Handle Cancel with Serial Voiding
  // ============================================
  const handleCancel = async () => {
    if (uniqueSerialIds.length === 0) {
      navigate(-1);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel?\n\n` +
      `${uniqueSerialIds.length} serial number(s) will be voided and can be regenerated later.`
    );

    if (!confirmed) {
      return;
    }

    setIsCancelling(true);

    try {
      const result = await api.voidBatchSerials(uniqueSerialIds);
      
      if (result.success) {
        toast.success(`${result.data.voided} serial number(s) voided`);
      } else {
        toast.error('Failed to void serials, but navigating back anyway');
      }
    } catch (error) {
      console.error('Error voiding serials:', error);
      toast.error('Error voiding serials');
    } finally {
      setIsCancelling(false);
      navigate(-1);
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-2" size={24} />
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (expandedLabels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No labels to print</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentConfig = PAPER_CONFIGS[paperType];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Panel - Configuration */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h1 className="text-xl font-bold text-gray-900 mb-2">PRINT PREVIEW</h1>
        <p className="text-xs text-gray-500 mb-6">CONFIGURE YOUR PRINT SETTINGS</p>

        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-4">PRINT CONFIGURATIONS</h2>
            
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">PAPER TYPE</label>
              
              {/* Custom Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-3 py-2 text-left text-sm border border-gray-300 rounded-md bg-white flex items-center justify-between hover:border-gray-400 transition-colors"
                  disabled={isPrinting || isCancelling}
                >
                  <span className="text-gray-700 font-medium">{PAPER_CONFIGS[paperType].name}</span>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    {Object.entries(PAPER_CONFIGS).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setPaperType(key);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          paperType === key ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700'
                        }`}
                      >
                        {config.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dimension Info */}
            <div className="mt-4 text-xs text-gray-600 space-y-2 bg-white p-3 rounded border border-gray-100">
              <p className="font-semibold text-gray-700 border-b pb-1 mb-2">DIMENSIONS</p>
              <p><span className="text-gray-500">Page:</span> {currentConfig.pageWidth} × {currentConfig.pageHeight}</p>
              <p><span className="text-gray-500">Label:</span> {currentConfig.labelWidth} × {currentConfig.labelHeight}</p>
              <p><span className="text-gray-500">Layout:</span> {currentConfig.labelsPerRow} × {currentConfig.labelsPerColumn}</p>
            </div>

            {/* Count Info */}
            <div className="mt-4 text-xs text-gray-600 space-y-1 bg-white p-3 rounded border border-gray-100">
              <p className="font-semibold text-gray-700 border-b pb-1 mb-2">LABEL COUNT</p>
              <p><span className="text-gray-500">Unique Serials:</span> <span className="font-medium">{uniqueSerialIds.length}</span></p>
              <p><span className="text-gray-500">Total Labels:</span> <span className="font-medium">{expandedLabels.length}</span></p>
              <p><span className="text-gray-500">Labels/Page:</span> <span className="font-medium">{currentConfig.labelsPerPage}</span></p>
              <p><span className="text-gray-500">Total Pages:</span> <span className="font-medium">{pages.length}</span></p>
            </div>

            {/* ⚠️ PRINT SETTINGS WARNING */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-amber-800 mb-1">PRINTER SETTINGS</p>
                  <ul className="text-amber-700 space-y-0.5">
                    <li>• Scale: <strong>100%</strong> or <strong>Actual Size</strong></li>
                    <li>• Margins: <strong>None</strong> or <strong>Minimum</strong></li>
                    <li>• Do NOT use "Fit to Page"</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Company Config Info */}
            {companyConfig && (
              <div className="mt-4 text-xs text-gray-600 space-y-1 bg-white p-3 rounded border border-gray-100">
                <p className="font-semibold text-gray-700 border-b pb-1 mb-2">COMPANY CONFIG</p>
                <p className="truncate"><span className="text-gray-500">Name:</span> {companyConfig.company_name}</p>
                <p><span className="text-gray-500">Phone:</span> {companyConfig.call_assistant_no || 'Not set'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1"
            disabled={isPrinting || isCancelling}
          >
            {isCancelling ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> VOIDING...
              </>
            ) : (
              'CANCEL'
            )}
          </Button>
          <Button 
            onClick={handlePrint}
            className="flex-1 bg-primary hover:bg-primary/90"
            disabled={isPrinting || isCancelling}
          >
            {isPrinting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> SAVING...
              </>
            ) : (
              <>
                <Printer size={16} className="mr-2" />
                PRINT NOW
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 p-6 overflow-auto bg-gray-200">
        <h2 className="text-center text-sm font-bold text-gray-600 mb-4">
          {PAPER_CONFIGS[paperType].name} PREVIEW
        </h2>
        
        <div className="flex flex-col items-center" style={{ transform: "scale(0.6)", transformOrigin: "top center" }}>
          {pages.map((pageLabels, pageIdx) => (
            <PrintPage 
              key={pageIdx}
              labels={pageLabels}
              paperType={paperType}
              pageIndex={pageIdx}
              companyConfig={companyConfig}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PrintPreview;