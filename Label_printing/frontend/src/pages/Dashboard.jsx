// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { 
//   Tag, 
//   Copy, 
//   Package, 
//   CalendarDays,
//   Clock,
//   ChevronDown,
//   Filter,
//   TrendingUp,
//   ArrowRight,
//   Printer,
//   RefreshCw
// } from "lucide-react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Cell
// } from "recharts";
// import * as api from "@/services/api";

// // ============================================
// // CONSTANTS
// // ============================================
// const FILTER_OPTIONS = [
//   { value: "today", label: "TODAY" },
//   { value: "thisWeek", label: "THIS WEEK" },
//   { value: "thisMonth", label: "THIS MONTH" },
//   { value: "thisYear", label: "THIS YEAR" }
// ];

// const BAR_COLORS = [
//   '#3b82f6', // Blue
//   '#f97316', // Orange
//   '#06b6d4', // Cyan
//   '#22c55e', // Green
//   '#8b5cf6', // Purple
//   '#ec4899', // Pink
// ];

// // ============================================
// // MAIN DASHBOARD COMPONENT
// // ============================================
// function Dashboard() {
//   const navigate = useNavigate();
  
//   // State
//   const [stats, setStats] = useState({
//     totalLabels: 0,
//     totalDuplicates: 0,
//     activeProducts: 0,
//     labelsToday: 0
//   });
//   const [chartData, setChartData] = useState([]);
//   const [recentEvents, setRecentEvents] = useState([]);
//   const [chartFilter, setChartFilter] = useState("thisMonth");
//   const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [chartLoading, setChartLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // ============================================
//   // DATA FETCHING
//   // ============================================
  
//   // Fetch all dashboard data on mount
//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   // Fetch chart data when filter changes (after initial load)
//   useEffect(() => {
//     if (!loading) {
//       fetchChartData();
//     }
//   }, [chartFilter]);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await api.getDashboardData(chartFilter);
      
//       if (response.success) {
//         setStats(response.data.stats);
//         setChartData(response.data.chartData);
//         setRecentEvents(response.data.recentEvents);
//       } else {
//         throw new Error(response.message || "Failed to fetch dashboard data");
//       }
//     } catch (err) {
//       console.error("Failed to fetch dashboard data:", err);
//       setError(err.message || "Failed to load dashboard");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchChartData = async () => {
//     try {
//       setChartLoading(true);
      
//       const response = await api.getDashboardChart(chartFilter);
      
//       if (response.success) {
//         setChartData(response.data);
//       }
//     } catch (err) {
//       console.error("Failed to fetch chart data:", err);
//     } finally {
//       setChartLoading(false);
//     }
//   };

//   // ============================================
//   // HELPERS
//   // ============================================
  
//   const formatEventDate = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffMs = now - date;
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);

//     if (diffMins < 1) return "Just now";
//     if (diffMins < 60) return `${diffMins} min ago`;
//     if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
//     if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
//     return date.toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric',
//       year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
//     });
//   };

//   const getFilterLabel = () => {
//     return FILTER_OPTIONS.find(opt => opt.value === chartFilter)?.label || "THIS MONTH";
//   };

//   const handleEventClick = (eventId) => {
//     navigate(`/reports`, { state: { selectedEventId: eventId } });
//   };

//   const getBarColor = (index) => {
//     return BAR_COLORS[index % BAR_COLORS.length];
//   };

//   // ============================================
//   // LOADING STATE
//   // ============================================
//   if (loading) {
//     return (
//       <div className="p-6">
//         {/* Header Skeleton */}
//         <div className="mb-6">
//           <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2"></div>
//           <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
//         </div>

//         {/* Stats Cards Skeleton */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="bg-card border-2 border-muted rounded-lg p-4 flex items-center gap-4">
//               <div className="w-12 h-12 bg-muted rounded-lg animate-pulse"></div>
//               <div>
//                 <div className="h-3 w-24 bg-muted rounded animate-pulse mb-2"></div>
//                 <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Chart & Events Skeleton */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
//             <div className="flex justify-between mb-6">
//               <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
//               <div className="h-10 w-36 bg-muted rounded animate-pulse"></div>
//             </div>
//             <div className="h-80 bg-muted/30 rounded animate-pulse"></div>
//           </div>
//           <div className="bg-card border border-border rounded-lg p-6">
//             <div className="h-6 w-40 bg-muted rounded animate-pulse mb-4"></div>
//             {[1, 2, 3, 4, 5].map((i) => (
//               <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse mb-3"></div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // ERROR STATE
//   // ============================================
//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="mb-6">
//           <p className="text-sm font-medium text-primary tracking-wide">ANALYTICS</p>
//           <h1 className="text-3xl font-bold text-foreground">DASHBOARD</h1>
//         </div>
        
//         <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center max-w-md mx-auto">
//           <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
//             <TrendingUp size={32} className="text-destructive" />
//           </div>
//           <p className="text-destructive font-semibold text-lg mb-2">Failed to Load Dashboard</p>
//           <p className="text-sm text-muted-foreground mb-6">{error}</p>
//           <button 
//             onClick={fetchDashboardData}
//             className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
//           >
//             <RefreshCw size={16} />
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ============================================
//   // MAIN RENDER
//   // ============================================
//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="mb-6">
//         <p className="text-sm font-medium text-primary tracking-wide">ANALYTICS</p>
//         <h1 className="text-3xl font-bold text-foreground">DASHBOARD</h1>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatCard 
//           icon={Tag} 
//           label="TOTAL LABELS" 
//           value={stats.totalLabels.toLocaleString()} 
//           borderColor="border-green-500"
//           iconBg="bg-green-500/10"
//           iconColor="text-green-600"
//         />
//         <StatCard 
//           icon={Copy} 
//           label="DUPLICATES" 
//           value={stats.totalDuplicates.toLocaleString()} 
//           borderColor="border-green-500"
//           iconBg="bg-blue-500/10"
//           iconColor="text-blue-600"
//         />
//         <StatCard 
//           icon={Package} 
//           label="NO OF PRODUCTS" 
//           value={stats.activeProducts.toLocaleString()} 
//           borderColor="border-green-500"
//           iconBg="bg-green-500/10"
//           iconColor="text-green-600"
//         />
//         <StatCard 
//           icon={CalendarDays} 
//           label="LABELS TODAY" 
//           value={stats.labelsToday.toLocaleString()} 
//           borderColor="border-orange-500"
//           iconBg="bg-orange-500/10"
//           iconColor="text-orange-600"
//         />
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
//         {/* Bar Chart - Takes 2 columns */}
//         <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-bold text-foreground">BAR CHART</h2>
            
//             {/* Filter Dropdown */}
//             <div className="relative">
//               <button
//                 onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
//                 className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
//               >
//                 <Filter size={16} className="text-muted-foreground" />
//                 {getFilterLabel()}
//                 <ChevronDown 
//                   size={16} 
//                   className={`text-muted-foreground transition-transform duration-200 ${filterDropdownOpen ? 'rotate-180' : ''}`} 
//                 />
//               </button>

//               {filterDropdownOpen && (
//                 <>
//                   {/* Backdrop */}
//                   <div 
//                     className="fixed inset-0 z-40" 
//                     onClick={() => setFilterDropdownOpen(false)}
//                   />
                  
//                   {/* Dropdown Menu */}
//                   <div className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-md shadow-lg py-1 z-50">
//                     {FILTER_OPTIONS.map((option) => (
//                       <button
//                         key={option.value}
//                         onClick={() => {
//                           setChartFilter(option.value);
//                           setFilterDropdownOpen(false);
//                         }}
//                         className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
//                           chartFilter === option.value 
//                             ? 'bg-primary/10 text-primary font-medium' 
//                             : 'text-foreground hover:bg-muted'
//                         }`}
//                       >
//                         {option.label}
//                       </button>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Chart */}
//           <div className="h-80 relative">
//             {chartLoading && (
//               <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg">
//                 <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
//               </div>
//             )}
            
//             {chartData.length > 0 ? (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
//                   <XAxis 
//                     dataKey="name" 
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
//                   />
//                   <YAxis 
//                     axisLine={false}
//                     tickLine={false}
//                     tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
//                     allowDecimals={false}
//                   />
//                   <Tooltip 
//                     contentStyle={{ 
//                       backgroundColor: 'hsl(var(--card))',
//                       border: '1px solid hsl(var(--border))',
//                       borderRadius: '8px',
//                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
//                     }}
//                     labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
//                     itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
//                     formatter={(value) => [`${value} labels`, 'Printed']}
//                     cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
//                   />
//                   <Bar 
//                     dataKey="labels" 
//                     radius={[4, 4, 0, 0]}
//                     maxBarSize={50}
//                   >
//                     {chartData.map((entry, index) => (
//                       <Cell 
//                         key={`cell-${index}`} 
//                         fill={getBarColor(index)}
//                       />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             ) : (
//               <div className="h-full flex items-center justify-center text-muted-foreground">
//                 <div className="text-center">
//                   <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
//                   <p className="font-medium">No data available</p>
//                   <p className="text-sm mt-1">No labels printed during this period</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Recent Events - Takes 1 column */}
//         <div className="bg-card border border-border rounded-lg p-6">
//           <div className="flex items-center gap-2 mb-4">
//             <Clock size={20} className="text-primary" />
//             <h2 className="text-xl font-bold text-foreground">RECENT EVENTS</h2>
//           </div>

//           {recentEvents.length > 0 ? (
//             <div className="space-y-3">
//               {recentEvents.map((event) => (
//                 <div
//                   key={event.overall_report_id}
//                   onClick={() => handleEventClick(event.overall_report_id)}
//                   className="p-3 bg-muted/30 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group"
//                 >
//                   <div className="flex items-start justify-between mb-2">
//                     <div className="flex items-center gap-2">
//                       <Printer size={14} className="text-primary" />
//                       <span className="font-mono text-xs text-muted-foreground truncate max-w-[140px]">
//                         {event.event_number}
//                       </span>
//                     </div>
//                     <ArrowRight 
//                       size={14} 
//                       className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" 
//                     />
//                   </div>
                  
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-sm font-semibold text-foreground">
//                         {event.number_of_label_printed || event.unique_labels || 0} Labels
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         {formatEventDate(event.created_at)}
//                       </p>
//                     </div>
//                     {event.total_prints > event.unique_labels && (
//                       <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded flex-shrink-0">
//                         +{event.total_prints - event.unique_labels} reprints
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               ))}

//               {/* View All Link */}
//               <button
//                 onClick={() => navigate('/reports')}
//                 className="w-full py-2.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1 border border-dashed border-border rounded-lg hover:border-primary/30 hover:bg-primary/5"
//               >
//                 View All Events
//                 <ArrowRight size={14} />
//               </button>
//             </div>
//           ) : (
//             <div className="py-12 text-center text-muted-foreground">
//               <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Clock size={32} className="opacity-50" />
//               </div>
//               <p className="font-medium">No recent events</p>
//               <p className="text-sm mt-1 mb-4">Start by printing your first label</p>
//               <button
//                 onClick={() => navigate('/labels')}
//                 className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
//               >
//                 Print your first label
//                 <ArrowRight size={14} />
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================
// // STAT CARD COMPONENT
// // ============================================
// function StatCard({ icon: Icon, label, value, borderColor, iconBg, iconColor }) {
//   return (
//     <div 
//       className={`bg-card border-2 ${borderColor} rounded-lg p-4 flex items-center gap-4 transition-all hover:shadow-md hover:scale-[1.02]`}
//     >
//       <div className={`p-3 rounded-lg ${iconBg}`}>
//         <Icon size={24} className={iconColor} />
//       </div>
//       <div>
//         <p className="text-xs font-semibold text-muted-foreground tracking-wide">{label}</p>
//         <p className="text-3xl font-bold text-foreground">{value}</p>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Tag, 
  Copy, 
  Package, 
  CalendarDays,
  Clock,
  ChevronDown,
  Filter,
  TrendingUp,
  ArrowRight,
  Printer,
  RefreshCw,
  Plus
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import * as api from "@/services/api";

// ============================================
// CONSTANTS
// ============================================
const FILTER_OPTIONS = [
  { value: "today", label: "TODAY" },
  { value: "thisWeek", label: "THIS WEEK" },
  { value: "thisMonth", label: "THIS MONTH" },
  { value: "thisYear", label: "THIS YEAR" }
];

const BAR_COLORS = [
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#22c55e', // Green
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
function Dashboard() {
  const navigate = useNavigate();
  
  // State
  const [stats, setStats] = useState({
    totalLabels: 0,
    totalDuplicates: 0,
    activeProducts: 0,
    labelsToday: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [chartFilter, setChartFilter] = useState("thisMonth");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // DATA FETCHING
  // ============================================
  
  // Fetch all dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch chart data when filter changes (after initial load)
  useEffect(() => {
    if (!loading) {
      fetchChartData();
    }
  }, [chartFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getDashboardData(chartFilter);
      
      if (response.success) {
        setStats(response.data.stats);
        setChartData(response.data.chartData);
        setRecentEvents(response.data.recentEvents);
      } else {
        throw new Error(response.message || "Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      
      const response = await api.getDashboardChart(chartFilter);
      
      if (response.success) {
        setChartData(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    } finally {
      setChartLoading(false);
    }
  };

  // ============================================
  // HELPERS
  // ============================================
  
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getFilterLabel = () => {
    return FILTER_OPTIONS.find(opt => opt.value === chartFilter)?.label || "THIS MONTH";
  };

  const handleEventClick = (eventId) => {
    navigate(`/reports`, { state: { selectedEventId: eventId } });
  };

  const getBarColor = (index) => {
    return BAR_COLORS[index % BAR_COLORS.length];
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="p-6">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2"></div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {/* ADD NEW Button Skeleton */}
          <div className="bg-primary/50 rounded-lg p-4 flex items-center justify-center gap-2 animate-pulse min-h-[88px]">
            <div className="w-5 h-5 bg-primary-foreground/30 rounded"></div>
            <div className="h-5 w-20 bg-primary-foreground/30 rounded"></div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border-2 border-muted rounded-lg p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-lg animate-pulse"></div>
              <div>
                <div className="h-3 w-24 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart & Events Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between mb-6">
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-36 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="h-80 bg-muted/30 rounded animate-pulse"></div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="h-6 w-40 bg-muted rounded animate-pulse mb-4"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse mb-3"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <p className="text-sm font-medium text-primary tracking-wide">ANALYTICS</p>
          <h1 className="text-3xl font-bold text-foreground">DASHBOARD</h1>
        </div>
        
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} className="text-destructive" />
          </div>
          <p className="text-destructive font-semibold text-lg mb-2">Failed to Load Dashboard</p>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-medium text-primary tracking-wide">ANALYTICS</p>
        <h1 className="text-3xl font-bold text-foreground">DASHBOARD</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {/* ADD NEW Button */}
        <button
          onClick={() => navigate('/labels')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg p-4 flex items-center justify-center gap-2 transition-all hover:shadow-md hover:scale-[1.02] min-h-[88px]"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span className="text-base font-semibold">ADD NEW</span>
        </button>

        <StatCard 
          icon={Tag} 
          label="TOTAL LABELS" 
          value={stats.totalLabels.toLocaleString()} 
          borderColor="border-blue-500"
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
        />
        <StatCard 
          icon={Copy} 
          label="DUPLICATES" 
          value={stats.totalDuplicates.toLocaleString()} 
          borderColor="border-blue-500"
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
        />
        <StatCard 
          icon={Package} 
          label="NO OF PRODUCTS" 
          value={stats.activeProducts.toLocaleString()} 
          borderColor="border-green-500"
          iconBg="bg-green-500/10"
          iconColor="text-green-600"
        />
        <StatCard 
          icon={CalendarDays} 
          label="LABELS TODAY" 
          value={stats.labelsToday.toLocaleString()} 
          borderColor="border-orange-500"
          iconBg="bg-orange-500/10"
          iconColor="text-orange-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart - Takes 2 columns */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">BAR CHART</h2>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Filter size={16} className="text-muted-foreground" />
                {getFilterLabel()}
                <ChevronDown 
                  size={16} 
                  className={`text-muted-foreground transition-transform duration-200 ${filterDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {filterDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setFilterDropdownOpen(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-md shadow-lg py-1 z-50">
                    {FILTER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setChartFilter(option.value);
                          setFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          chartFilter === option.value 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="h-80 relative">
            {chartLoading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                    itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
                    formatter={(value) => [`${value} labels`, 'Printed']}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  />
                  <Bar 
                    dataKey="labels" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getBarColor(index)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No data available</p>
                  <p className="text-sm mt-1">No labels printed during this period</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Events - Takes 1 column */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-primary" />
            <h2 className="text-xl font-bold text-foreground">RECENT EVENTS</h2>
          </div>

          {recentEvents.length > 0 ? (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div
                  key={event.overall_report_id}
                  onClick={() => handleEventClick(event.overall_report_id)}
                  className="p-3 bg-muted/30 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Printer size={14} className="text-primary" />
                      <span className="font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                        {event.event_number}
                      </span>
                    </div>
                    <ArrowRight 
                      size={14} 
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {event.number_of_label_printed || event.unique_labels || 0} Labels
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatEventDate(event.created_at)}
                      </p>
                    </div>
                    {event.total_prints > event.unique_labels && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded flex-shrink-0">
                        +{event.total_prints - event.unique_labels} reprints
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* View All Link */}
              <button
                onClick={() => navigate('/reports')}
                className="w-full py-2.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1 border border-dashed border-border rounded-lg hover:border-primary/30 hover:bg-primary/5"
              >
                View All Events
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="opacity-50" />
              </div>
              <p className="font-medium">No recent events</p>
              <p className="text-sm mt-1 mb-4">Start by printing your first label</p>
              <button
                onClick={() => navigate('/labels')}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Print your first label
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({ icon: Icon, label, value, borderColor, iconBg, iconColor }) {
  return (
    <div 
      className={`bg-card border-2 ${borderColor} rounded-lg p-4 flex items-center gap-4 transition-all hover:shadow-md hover:scale-[1.02]`}
    >
      <div className={`p-3 rounded-lg ${iconBg}`}>
        <Icon size={24} className={iconColor} />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default Dashboard;