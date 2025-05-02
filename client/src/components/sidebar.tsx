import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, ADMIN_NAV_ITEMS, DEFAULT_BUSINESS_UNITS } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location] = useLocation();

  // Fetch business units from API
  const { data: businessUnits = DEFAULT_BUSINESS_UNITS } = useQuery({
    queryKey: ["/api/business-units"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: DEFAULT_BUSINESS_UNITS,
  });

  return (
    <aside className="hidden md:block bg-secondary text-white w-56 flex-shrink-0">
      <nav className="mt-6 px-2">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link 
              key={item.name} 
              href={item.path}
            >
              <a 
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  location === item.path 
                    ? "bg-primary bg-opacity-30" 
                    : "text-white hover:bg-primary hover:bg-opacity-30"
                )}
              >
                <i className={`fas fa-${item.icon} w-6`}></i>
                <span>{item.name}</span>
              </a>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Business Units
          </h3>
          <div className="mt-2 space-y-1">
            {businessUnits.map((unit, index) => (
              <Link 
                key={unit.name} 
                href={`/?businessUnit=${unit.name}`}
              >
                <a className="flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-primary hover:bg-opacity-30 rounded-md">
                  <span 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: unit.color }}
                  ></span>
                  <span>{unit.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Admin
          </h3>
          <div className="mt-2 space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => (
              <Link 
                key={item.name} 
                href={item.path}
              >
                <a 
                  className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    location === item.path 
                      ? "bg-primary bg-opacity-30" 
                      : "text-white hover:bg-primary hover:bg-opacity-30"
                  )}
                >
                  <i className={`fas fa-${item.icon} w-6`}></i>
                  <span>{item.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
