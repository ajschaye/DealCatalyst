import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEAL_STAGES, DEAL_TYPES, CURRENT_USER } from "@/lib/constants";

interface FilterBarProps {
  onApplyFilters: (filters: {
    stage?: string;
    leadOwner?: number;
    businessUnit?: number;
    dealType?: string;
  }) => void;
}

export default function FilterBar({ onApplyFilters }: FilterBarProps) {
  const [stage, setStage] = useState<string>("all_stages");
  const [leadOwner, setLeadOwner] = useState<string>("all_owners");
  const [businessUnit, setBusinessUnit] = useState<string>("all_units");
  const [dealType, setDealType] = useState<string>("all_types");

  // Fetch users for the lead owner dropdown
  const { data: users = [CURRENT_USER] } = useQuery({
    queryKey: ["/api/users"],
    placeholderData: [CURRENT_USER],
  });

  // Fetch business units
  const { data: businessUnits = [] } = useQuery<any[]>({
    queryKey: ["/api/business-units"],
  });

  const handleApplyFilters = () => {
    onApplyFilters({
      stage: stage && stage !== "all_stages" ? stage : undefined,
      leadOwner: leadOwner && leadOwner !== "all_owners" ? parseInt(leadOwner) : undefined,
      businessUnit: businessUnit && businessUnit !== "all_units" ? parseInt(businessUnit) : undefined,
      dealType: dealType && dealType !== "all_types" ? dealType : undefined,
    });
  };

  const handleResetFilters = () => {
    setStage("all_stages");
    setLeadOwner("all_owners");
    setBusinessUnit("all_units");
    setDealType("all_types");
    onApplyFilters({});
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full sm:w-auto">
            <Label className="block text-sm font-medium mb-1">Deal Stage</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_stages">All Stages</SelectItem>
                {DEAL_STAGES.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Label className="block text-sm font-medium mb-1">Lead Owner</Label>
            <Select value={leadOwner} onValueChange={setLeadOwner}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Owners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_owners">All Owners</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Label className="block text-sm font-medium mb-1">Business Unit</Label>
            <Select value={businessUnit} onValueChange={setBusinessUnit}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_units">All Units</SelectItem>
                {businessUnits.map((unit: any) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <Label className="block text-sm font-medium mb-1">Deal Type</Label>
            <Select value={dealType} onValueChange={setDealType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_types">All Types</SelectItem>
                {DEAL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto mt-auto">
            <Button 
              onClick={handleApplyFilters} 
              className="bg-primary text-white"
            >
              Apply Filters
            </Button>
            <Button 
              onClick={handleResetFilters} 
              variant="ghost" 
              className="ml-2"
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
