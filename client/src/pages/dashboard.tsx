import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, LayoutGrid, List, Columns } from "lucide-react";
import DealStats from "@/components/deal-stats";
import FilterBar from "@/components/filter-bar";
import DealTable from "@/components/deal-table";
import DealCard from "@/components/deal-card";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<string>("table");
  const [search, setSearch] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("active");
  const [filters, setFilters] = useState<{
    stage?: string;
    leadOwnerId?: number;
    businessUnitId?: number;
    dealType?: string;
    search?: string;
  }>({});

  // Fetch deals for recently updated section
  const { data: recentDeals = [] } = useQuery<any[]>({
    queryKey: ["/api/deals", { limit: 3 }],
  });

  // Fetch activity timeline
  const { data: activities = [] } = useQuery<any[]>({
    queryKey: ["/api/activity", { limit: 3 }],
  });

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters({ ...newFilters, search });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearch(searchTerm);
    
    // Debounce search (apply after 300ms of no typing)
    const timeoutId = setTimeout(() => {
      setFilters({ ...filters, search: searchTerm });
    }, 300);
    
    // Cleanup timeout on next change
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Deal Dashboard</h1>
        <div className="flex space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search deals..."
              className="px-4 py-2 w-64"
              value={search}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === "Enter" && setFilters({ ...filters, search })}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setFilters({ ...filters, search })}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("table")}
              className="rounded-l-none rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("kanban")}
              className="rounded-l-none"
            >
              <Columns className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <FilterBar onApplyFilters={handleApplyFilters} />
      <DealStats />

      <Tabs 
        defaultValue="active" 
        className="mb-8"
        value={selectedTab}
        onValueChange={(value) => setSelectedTab(value)}
      >
        <TabsList>
          <TabsTrigger value="active">Active Deals</TabsTrigger>
          <TabsTrigger value="closed">Closed Deals</TabsTrigger>
          <TabsTrigger value="all">All Deals</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          {viewMode === "table" && (
            <DealTable 
              filters={{ 
                ...filters, 
                // Filter out closed deals
                stage: filters.stage || ['Closed Won', 'Closed Lost'].includes(filters.stage || '') ? filters.stage : 'active'
              }} 
            />
          )}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {recentDeals
                .filter(deal => !['Closed Won', 'Closed Lost'].includes(deal.stage))
                .map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))
              }
            </div>
          )}
          {viewMode === "kanban" && (
            <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-md mb-8">
              <h3 className="text-lg font-medium mb-2">Kanban View</h3>
              <p className="text-muted-foreground">Kanban view is coming soon.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="closed" className="mt-4">
          {viewMode === "table" && (
            <DealTable 
              filters={{ 
                ...filters, 
                // Only show closed deals (Closed Won or Closed Lost)
                stage: 'closed'
              }} 
            />
          )}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {recentDeals
                .filter(deal => ['Closed Won', 'Closed Lost'].includes(deal.stage))
                .map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))
              }
            </div>
          )}
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          {viewMode === "table" && <DealTable filters={{ ...filters, stage: undefined }} />}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {recentDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow overflow-hidden border border-border">
          <div className="px-6 py-4 border-b border-border bg-muted">
            <h2 className="font-semibold text-lg">Recently Updated</h2>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-border">
              {recentDeals.slice(0, 3).map((deal) => (
                <li key={deal.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-md bg-primary text-white flex items-center justify-center font-bold">
                      {deal.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{deal.company}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(deal.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-accent bg-opacity-10 text-accent">
                    {deal.stage}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden border border-border">
          <div className="px-6 py-4 border-b border-border bg-muted">
            <h2 className="font-semibold text-lg">Deal Timeline</h2>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-border">
              {activities.slice(0, 3).map((activity) => (
                <li key={activity.id} className="py-3 flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-accent mt-1"></div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <p className="text-sm font-medium">
                        {activity.deal.company} - {activity.action}
                      </p>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.user.fullName} {activity.action.toLowerCase()}.
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
