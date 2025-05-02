import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartPie, DollarSign, Handshake, CalendarCheck } from "lucide-react";

export default function DealStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const statItems = [
    {
      title: "Total Deals",
      value: stats?.totalDeals || 0,
      icon: <ChartPie className="text-primary" />,
      bgColor: "bg-primary bg-opacity-10",
    },
    {
      title: "Active Negotiations",
      value: stats?.activeNegotiations || 0,
      icon: <Handshake className="text-accent" />,
      bgColor: "bg-accent bg-opacity-10",
    },
    {
      title: "Total Investment",
      value: stats?.totalInvestment
        ? `$${(stats.totalInvestment / 1000000).toFixed(1)}M`
        : "$0",
      icon: <DollarSign className="text-[#FFAB00]" />,
      bgColor: "bg-[#FFAB00] bg-opacity-10",
    },
    {
      title: "Closed This Month",
      value: stats?.closedThisMonth || 0,
      icon: <CalendarCheck className="text-[#00B8D9]" />,
      bgColor: "bg-[#00B8D9] bg-opacity-10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className={`rounded-full ${item.bgColor} p-3 mr-4`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.title}</p>
                <p className="text-2xl font-semibold">{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
