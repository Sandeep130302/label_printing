import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Printer, Database, FileText, Settings } from "lucide-react";

const navItems = [
  { to: "/", label: "DASHBOARD", icon: LayoutDashboard },           // ✅ NEW
  { to: "/labels", label: "LABEL PRINTING", icon: Printer },        // ✅ Updated path
  { to: "/master", label: "MASTER MANAGEMENT", icon: Database },
  { to: "/reports", label: "REPORTS", icon: FileText },
  { to: "/settings", label: "SETTINGS", icon: Settings }
];

function AppSidebar() {
  const location = useLocation();
  
  return (
    <aside 
      className="w-56 min-h-screen flex flex-col justify-between" 
      style={{ background: "#49494b" }}
    >
      <div>
        {/* Brand */}
        <div className="px-5 pt-6 pb-4">
          <h1 
            className="text-3xl font-extrabold tracking-tight" 
            style={{ color: "hsl(0 0% 100%)" }}
          >
            JEROBYTE
          </h1>
        </div>

        {/* Nav */}
        <nav className="mt-2 flex flex-col gap-0.5 px-2">
          {navItems.map((item) => {
            // Check if active - exact match for "/" and startsWith for others
            const active = item.to === "/" 
              ? location.pathname === "/" 
              : location.pathname.startsWith(item.to);
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-semibold tracking-wide transition-colors ${
                  active ? "border-l-[3px]" : "border-l-[3px] border-transparent"
                }`}
                style={
                  active
                    ? {
                        color: "hsl(var(--sidebar-active))",
                        background: "hsl(var(--sidebar-hover))",
                        borderColor: "hsl(var(--sidebar-active))"
                      }
                    : {
                        color: "hsl(var(--sidebar-fg))"
                      }
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

export default AppSidebar;