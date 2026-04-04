


// import { useState, useMemo, useEffect } from "react";
// import { Eye, Printer, Calendar } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import { QRCodeSVG } from "qrcode.react";

// // ✅ Import API and hooks
// import { useApi, useMutation } from "@/hooks/useApi";
// import * as api from "@/services/api";

// const FILTERS = [
//   { key: "all", label: "All" },
//   { key: "today", label: "Today" },
//   { key: "yesterday", label: "Yesterday" },
//   { key: "week", label: "This Week" },
//   { key: "month", label: "This Month" }
// ];

// function matchesFilter(dateStr, filter) {
//   const date = new Date(dateStr);
//   const now = new Date();
//   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

//   if (filter === "all") return true;
//   if (filter === "today") return date >= today;
//   if (filter === "yesterday") {
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);
//     return date >= yesterday && date < today;
//   }
//   if (filter === "week") {
//     const weekAgo = new Date(today);
//     weekAgo.setDate(weekAgo.getDate() - 7);
//     return date >= weekAgo;
//   }
//   if (filter === "month") {
//     const monthAgo = new Date(today);
//     monthAgo.setMonth(monthAgo.getMonth() - 1);
//     return date >= monthAgo;
//   }
//   return true;
// }

// function Reports() {
//   const [filter, setFilter] = useState("all");
//   const [detailEvent, setDetailEvent] = useState(null);
//   const [eventLabels, setEventLabels] = useState([]);
//   const [labelsLoading, setLabelsLoading] = useState(false);

//   // ✅ Fetch event reports from API
//   const { data: eventsResponse, loading: eventsLoading, error: eventsError } = useApi(api.getEventReports);
//   const events = eventsResponse?.data || [];

//   // ✅ Mutation for marking as reprinted
//   const { mutate: markReprinted } = useMutation(api.markAsReprinted);

//   const filtered = useMemo(
//     () => events.filter((e) => matchesFilter(e.created_at, filter)),
//     [events, filter]
//   );

//   // ✅ Fetch labels when event is selected
//   useEffect(() => {
//     async function fetchEventLabels() {
//       if (!detailEvent) {
//         setEventLabels([]);
//         return;
//       }
      
//       setLabelsLoading(true);
//       try {
//         const result = await api.getReportsByEvent(detailEvent.overall_report_id);
//         if (result.success && result.data) {
//           setEventLabels(result.data);
//         }
//       } catch (error) {
//         console.error("Failed to fetch event labels:", error);
//         toast.error("Failed to load labels");
//       } finally {
//         setLabelsLoading(false);
//       }
//     }
    
//     fetchEventLabels();
//   }, [detailEvent]);

//   const handleReprint = async (label) => {
//     try {
//       await markReprinted(label.report_id);
//       toast.success(`Reprint queued for serial ${label.serial_number}`);
//     } catch (err) {
//       toast.error("Failed to queue reprint");
//     }
//   };

//   if (eventsLoading) {
//     return <div className="p-6 text-center">Loading reports...</div>;
//   }

//   if (eventsError) {
//     return <div className="p-6 text-center text-destructive">Error: {eventsError}</div>;
//   }

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <p className="erp-section-label">ANALYTICS</p>
//           <h2 className="erp-page-title">PRINT EVENT REPORTS</h2>
//         </div>
//       </div>

//       <div className="flex gap-2 mb-4">
//         {FILTERS.map((f) => (
//           <button
//             key={f.key}
//             onClick={() => setFilter(f.key)}
//             className={`px-4 py-2 text-xs font-bold tracking-wider rounded-md transition-colors ${
//               filter === f.key
//                 ? "bg-primary text-primary-foreground"
//                 : "bg-muted text-muted-foreground hover:text-foreground"
//             }`}
//           >
//             {f.label}
//           </button>
//         ))}
//       </div>

//       <div className="erp-card">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="erp-table-header">
//               <th className="px-4 py-3 text-left">EVENT NO</th>
//               <th className="px-4 py-3 text-left">LABELS PRINTED</th>
//               <th className="px-4 py-3 text-left">CREATED</th>
//               <th className="px-4 py-3 text-left">ACTIONS</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered && filtered.length > 0 ? (
//               filtered.map((event) => (
//                 <tr key={event.overall_report_id} className="border-b border-border hover:bg-muted/30 transition-colors">
//                   <td className="px-4 py-3 font-mono font-semibold text-primary">{event.event_number}</td>
//                   <td className="px-4 py-3">{event.number_of_label_printed}</td>
//                   <td className="px-4 py-3 text-muted-foreground">
//                     <div className="flex items-center gap-1">
//                       <Calendar size={12} />
//                       {new Date(event.created_at).toLocaleString()}
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <Button 
//                       variant="ghost" 
//                       size="sm" 
//                       className="h-7"
//                       onClick={() => setDetailEvent(event)}
//                     >
//                       <Eye size={14} className="mr-1" /> View
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
//                   No events found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Detail Dialog */}
//       <Dialog open={!!detailEvent} onOpenChange={() => setDetailEvent(null)}>
//         <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
//           <DialogHeader>
//             <DialogTitle>Event {detailEvent?.event_number} Details</DialogTitle>
//           </DialogHeader>
//           {detailEvent && (
//             <div className="overflow-x-auto">
//               {labelsLoading ? (
//                 <div className="py-8 text-center text-muted-foreground">
//                   Loading labels...
//                 </div>
//               ) : eventLabels.length > 0 ? (
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="erp-table-header">
//                       <th className="px-3 py-2 text-left">Product</th>
//                       <th className="px-3 py-2 text-left">Capacity</th>
//                       <th className="px-3 py-2 text-left">Model</th>
//                       <th className="px-3 py-2 text-left">Serial</th>
//                       <th className="px-3 py-2 text-left">MFG Code</th>
//                       <th className="px-3 py-2 text-left">SSN</th>
//                       <th className="px-3 py-2 text-left">QR</th>
//                       <th className="px-3 py-2 text-left">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {eventLabels.map((label, idx) => (
//                       <tr key={label.report_id || idx} className="border-b border-border">
//                         <td className="px-3 py-2">{label.product_name}</td>
//                         <td className="px-3 py-2">{label.capacity_name}</td>
//                         <td className="px-3 py-2">{label.model_name}</td>
//                         <td className="px-3 py-2 font-mono text-primary font-semibold">{label.serial_number}</td>
//                         <td className="px-3 py-2">{label.manufacturing_code}</td>
//                         <td className="px-3 py-2">{label.ssn}</td>
//                         <td className="px-3 py-2">
//                           <QRCodeSVG value={label.qr_data || label.serial_number || 'N/A'} size={40} />
//                         </td>
//                         <td className="px-3 py-2">
//                           <Button 
//                             variant="ghost" 
//                             size="sm" 
//                             className="h-7"
//                             onClick={() => handleReprint(label)}
//                           >
//                             <Printer size={12} className="mr-1" /> Reprint
//                           </Button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               ) : (
//                 <div className="py-8 text-center text-muted-foreground">
//                   No labels found for this event
//                 </div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// export default Reports;


import { useState, useMemo, useEffect } from "react";
import { Eye, Printer, Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import * as api from "@/services/api";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" }
];

function matchesFilter(dateStr, filter) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === "all") return true;
  if (filter === "today") return date >= today;
  if (filter === "yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return date >= yesterday && date < today;
  }
  if (filter === "week") {
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }
  if (filter === "month") {
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return date >= monthAgo;
  }
  return true;
}

function Reports() {
  const [filter, setFilter] = useState("all");
  const [detailEvent, setDetailEvent] = useState(null);
  
  // ✅ Direct state management instead of useApi hook
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  
  const [eventLabels, setEventLabels] = useState([]);
  const [labelsLoading, setLabelsLoading] = useState(false);

  // ✅ Fetch events on mount
  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      console.log('Fetching event reports...');
      const result = await api.getEventReports();
      console.log('Event reports result:', result);
      
      if (result.success && result.data) {
        setEvents(result.data);
        console.log('Events loaded:', result.data.length);
      } else {
        setEvents([]);
        console.log('No events found or error:', result);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEventsError(error.message);
      toast.error('Failed to load reports: ' + error.message);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Fetch labels when event is selected
  useEffect(() => {
    async function fetchEventLabels() {
      if (!detailEvent) {
        setEventLabels([]);
        return;
      }
      
      setLabelsLoading(true);
      try {
        console.log('Fetching labels for event:', detailEvent.overall_report_id);
        const result = await api.getReportsByEvent(detailEvent.overall_report_id);
        console.log('Labels result:', result);
        
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
  }, [detailEvent]);

  const filtered = useMemo(
    () => events.filter((e) => matchesFilter(e.created_at, filter)),
    [events, filter]
  );

  const handleReprint = async (label) => {
    try {
      await api.markAsReprinted(label.report_id);
      toast.success(`Reprint queued for serial ${label.serial_number}`);
    } catch (err) {
      toast.error("Failed to queue reprint");
    }
  };

  const handleRefresh = () => {
    fetchEvents();
    toast.success('Reports refreshed');
  };

  if (eventsLoading) {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="erp-section-label">ANALYTICS</p>
          <h2 className="erp-page-title">PRINT EVENT REPORTS</h2>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw size={14} className="mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-xs font-bold tracking-wider rounded-md transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="erp-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="erp-table-header">
              <th className="px-4 py-3 text-left">EVENT NO</th>
              <th className="px-4 py-3 text-left">LABELS PRINTED</th>
              <th className="px-4 py-3 text-left">CREATED</th>
              <th className="px-4 py-3 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered && filtered.length > 0 ? (
              filtered.map((event) => (
                <tr key={event.overall_report_id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{event.event_number}</td>
                  <td className="px-4 py-3">{event.number_of_label_printed}</td>
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
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No events found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailEvent} onOpenChange={() => setDetailEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="erp-table-header">
                      <th className="px-3 py-2 text-left">Product</th>
                      <th className="px-3 py-2 text-left">Capacity</th>
                      <th className="px-3 py-2 text-left">Model</th>
                      <th className="px-3 py-2 text-left">Serial</th>
                      <th className="px-3 py-2 text-left">MFG Code</th>
                      <th className="px-3 py-2 text-left">SSN</th>
                      <th className="px-3 py-2 text-left">QR</th>
                      <th className="px-3 py-2 text-left">Actions</th>
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
                        <td className="px-3 py-2">
                          <QRCodeSVG value={label.qr_data || label.serial_number || 'N/A'} size={40} />
                        </td>
                        <td className="px-3 py-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7"
                            onClick={() => handleReprint(label)}
                          >
                            <Printer size={12} className="mr-1" /> Reprint
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No labels found for this event
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Reports;
