import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface DealCardProps {
  deal: {
    id: number;
    company: string;
    stage: string;
    lastUpdated: string;
    businessUnit?: {
      name: string;
      color: string;
    };
  };
}

export default function DealCard({ deal }: DealCardProps) {
  const [, navigate] = useLocation();
  
  const getStageClass = (stage: string) => {
    switch (stage) {
      case "Initial Contact":
        return "bg-primary bg-opacity-10 text-primary";
      case "Discovery":
        return "bg-info bg-opacity-10 text-info";
      case "Proposal":
        return "bg-warning bg-opacity-10 text-warning";
      case "Negotiation":
        return "bg-accent bg-opacity-10 text-accent";
      case "Closed Won":
        return "bg-green-500 bg-opacity-10 text-green-500";
      case "Closed Lost":
        return "bg-destructive bg-opacity-10 text-destructive";
      default:
        return "bg-muted-foreground bg-opacity-10 text-muted-foreground";
    }
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const handleClick = () => {
    navigate(`/deals/${deal.id}`);
  };

  return (
    <Card className="hover:border-primary/50 cursor-pointer transition-all" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center bg-primary text-white font-bold">
              {getInitials(deal.company)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{deal.company}</p>
              <p className="text-xs text-muted-foreground">
                Updated {formatDistanceToNow(new Date(deal.lastUpdated), { addSuffix: true })}
              </p>
            </div>
          </div>
          <span className={cn("px-2 py-1 text-xs rounded-full", getStageClass(deal.stage))}>
            {deal.stage}
          </span>
        </div>
        
        {deal.businessUnit && (
          <div className="flex items-center mt-2">
            <span 
              className="w-2 h-2 rounded-full mr-2" 
              style={{ backgroundColor: deal.businessUnit.color }}
            ></span>
            <span className="text-xs">{deal.businessUnit.name}</span>
          </div>
        )}
        
        <div className="mt-3 flex justify-end">
          <Button 
            size="sm"
            variant="ghost" 
            className="text-primary hover:text-primary/80"
            onClick={handleClick}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
