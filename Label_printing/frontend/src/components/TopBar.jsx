import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Settings, Plus, Tag, Package, Gauge, Hash } from "lucide-react";

const topLinks = [
  { to: "/", label: "DASHBOARD" },                    // ✅ NEW
  { to: "/labels", label: "LABEL PRINTING" },         // ✅ Updated path
  { to: "/master", label: "MASTER MANAGEMENT" },
  { to: "/reports", label: "REPORTS" },
  { to: "/settings", label: "SETTINGS" }
];

const quickAddItems = [
  { 
    label: "ADD LABEL", 
    icon: Tag, 
    action: "navigate", 
    to: "/labels" 
  },
  { 
    label: "ADD PRODUCT", 
    icon: Package, 
    action: "navigate", 
    to: "/master",
    state: { tab: "products", openDialog: true }
  },
  { 
    label: "ADD CAPACITY", 
    icon: Gauge, 
    action: "navigate", 
    to: "/master",
    state: { tab: "capacities", openDialog: true }
  },
  { 
    label: "ADD MODEL", 
    icon: Hash, 
    action: "navigate", 
    to: "/master",
    state: { tab: "models", openDialog: true }
  }
];

function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowQuickAdd(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle quick add item click
  const handleQuickAddClick = (item) => {
    setShowQuickAdd(false);
    if (item.action === "navigate") {
      navigate(item.to, { state: item.state });
    }
  };

  return (
    <header 
      className="h-14 border-b flex items-center justify-between px-6" 
      style={{ 
        background: "hsl(var(--topbar-bg))", 
        borderColor: "hsl(var(--topbar-border))" 
      }}
    >
      {/* Navigation Links */}
      <nav className="flex items-center gap-6">
        {topLinks.map((link) => {
          const active = link.to === "/" 
            ? location.pathname === "/" 
            : location.pathname.startsWith(link.to);
          
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Right Side - Quick Add & Settings */}
      <div className="flex items-center gap-4">
        
        {/* ✅ Quick Add Button with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            title="Quick Add"
          >
            <Plus size={20} />
          </button>

          {/* Dropdown Menu */}
          {showQuickAdd && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg py-1 z-50"
            >
              {quickAddItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAddClick(item)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                >
                  <item.icon size={16} className="text-muted-foreground" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Settings Icon */}
        <NavLink 
          to="/settings"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings size={20} />
        </NavLink>
      </div>
    </header>
  );
}

export default TopBar;