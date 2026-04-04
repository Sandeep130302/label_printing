import { Search, Bell, HelpCircle, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
const topLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/master", label: "Master Management" },
  { to: "/reports", label: "Reports" }
 
];
function TopBar() {
  const location = useLocation();
  return <header className="h-14 border-b flex items-center justify-between px-6" style={{ background: "hsl(var(--topbar-bg))", borderColor: "hsl(var(--topbar-border))" }}>
      <nav className="flex items-center gap-6">
        {topLinks.map((link) => {
    const active = link.to === "/" ? location.pathname === "/" : location.pathname.startsWith(link.to);
    return <NavLink
      key={link.to}
      to={link.to}
      className={`text-sm font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
    >
              {link.label}
            </NavLink>;
  })}
      </nav>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
    type="text"
    placeholder="Search SKU..."
    className="pl-9 pr-4 py-1.5 text-sm rounded-md border border-input bg-background w-48 focus:outline-none focus:ring-1 focus:ring-ring"
  />
        </div>
        <NavLink to="/settings" className="text-muted-foreground hover:text-foreground">
  <Settings size={18} />
</NavLink>
        <button className="text-muted-foreground hover:text-foreground"><Bell size={18} /></button>
        {/* <button className="text-muted-foreground hover:text-foreground"><HelpCircle size={18} /></button> */}
        {/* <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">JR</div> */}
      </div>
    </header>;
}
export {
  TopBar as default
};
