import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import LabelPrinting from "./pages/LabelPrinting";
import MasterManagement from "./pages/MasterManagement";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage";
import PrintPreview from "./pages/PrintPreview";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<LabelPrinting />} />
            <Route path="/master" element={<MasterManagement />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/print-preview" element={<PrintPreview />} />
            
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;
var stdin_default = App;
export {
  stdin_default as default
};
