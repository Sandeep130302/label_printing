import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import TopBar from "./TopBar";
function AppLayout() {
  return <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>;
}
export {
  AppLayout as default
};
