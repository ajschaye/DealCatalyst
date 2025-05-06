import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STAGE_COLORS } from "@/lib/constants";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DealTableProps {
  filters?: {
    stage?: string;
    leadOwnerId?: number;
    businessUnitId?: number;
    dealType?: string;
    search?: string;
  };
}

export default function DealTable({ filters = {} }: DealTableProps) {
  const [, navigate] = useLocation();
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Fetch deals with applied filters
  const { data: deals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/deals", filters],
  });

  // Calculate pagination
  const totalPages = Math.ceil(deals.length / pageSize);
  const paginatedDeals = deals.slice((page - 1) * pageSize, page * pageSize);

  const handleEditDeal = (id: number) => {
    navigate(`/deals/${id}`);
  };

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader className="bg-muted">
          <CardTitle>Active Deals</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead>Company</TableHead>
                  <TableHead>Lead Owner</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Business Unit</TableHead>
                  <TableHead>Deal Type</TableHead>
                  <TableHead>AI Summary</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(4).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-16 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (deals.length === 0) {
    return (
      <Card className="mb-8">
        <CardHeader className="bg-muted">
          <CardTitle>Active Deals</CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">No deals found matching your criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader className="px-6 py-4 border-b border-border bg-muted">
        <CardTitle>Active Deals</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>Company</TableHead>
                <TableHead>Lead Owner</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Business Unit</TableHead>
                <TableHead>Deal Type</TableHead>
                <TableHead>AI Summary</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDeals.map((deal) => (
                <TableRow key={deal.id} className="hover:bg-muted">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center bg-primary text-white font-bold">
                        {deal.company.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">{deal.company}</div>
                        <div className="text-sm text-muted-foreground">
                          {deal.website?.replace(/^https?:\/\//, '')}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{deal.leadOwner?.fullName || "Unassigned"}</div>
                  </TableCell>
                  <TableCell>
                    {deal.stage === "Discovery" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary bg-opacity-10 text-primary">
                        Discovery
                      </span>
                    )}
                    {deal.stage === "Due Diligence" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-info bg-opacity-10 text-info">
                        Due Diligence
                      </span>
                    )}
                    {deal.stage === "Negotiation" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning bg-opacity-10 text-warning">
                        Negotiation
                      </span>
                    )}
                    {deal.stage === "Closed" && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-success bg-opacity-10 text-success">
                        Closed
                      </span>
                    )}
                    {!["Discovery", "Due Diligence", "Negotiation", "Closed"].includes(deal.stage) && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent bg-opacity-10 text-accent">
                        {deal.stage}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {deal.businessUnit && (
                        <>
                          <span 
                            className="w-2 h-2 rounded-full mr-2" 
                            style={{ backgroundColor: deal.businessUnit.color }}
                          ></span>
                          <span>{deal.businessUnit.name}</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{deal.dealType}</TableCell>
                  <TableCell>
                    <div className="truncate-2 max-w-md">
                      {deal.aiSummary || "No summary available"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(deal.lastUpdated), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditDeal(deal.id)}
                      className="text-primary hover:text-primary/80"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-border">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button 
                variant="outline" 
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * pageSize, deals.length)}
                  </span>{" "}
                  of <span className="font-medium">{deals.length}</span> results
                </p>
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Link href="#" onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        setPage(Math.max(1, page - 1));
                      }}>
                      <PaginationPrevious />
                    </Link>
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
                    <PaginationItem key={i}>
                      <Button 
                        variant={page === i + 1 ? "default" : "outline"}
                        onClick={() => setPage(i + 1)}
                        className="h-8 w-8"
                      >
                        {i + 1}
                      </Button>
                    </PaginationItem>
                  ))}
                  {totalPages > 3 && (
                    <PaginationItem>
                      <span className="px-4 py-2">...</span>
                    </PaginationItem>
                  )}
                  {totalPages > 3 && (
                    <PaginationItem>
                      <Button 
                        variant="outline"
                        onClick={() => setPage(totalPages)}
                        className="h-8 w-8"
                      >
                        {totalPages}
                      </Button>
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <Link href="#" onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        setPage(Math.min(totalPages, page + 1));
                      }}>
                      <PaginationNext />
                    </Link>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
