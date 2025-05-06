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

  // No need to fetch recent deals and activities anymore

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
            <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-md mb-8">
              <h3 className="text-lg font-medium mb-2">Grid View</h3>
              <p className="text-muted-foreground">Grid view is coming soon.</p>
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
            <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-md mb-8">
              <h3 className="text-lg font-medium mb-2">Grid View</h3>
              <p className="text-muted-foreground">Grid view is coming soon.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="all" className="mt-4">
          {viewMode === "table" && <DealTable filters={{ ...filters, stage: undefined }} />}
          {viewMode === "grid" && (
            <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-md mb-8">
              <h3 className="text-lg font-medium mb-2">Grid View</h3>
              <p className="text-muted-foreground">Grid view is coming soon.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>


    </div>
  );
}
