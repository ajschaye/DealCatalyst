import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CURRENT_USER } from "@/lib/constants";

export function useDealForm(dealId?: number) {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deal details if editing
  const { data: deal, isLoading: isDealLoading } = useQuery({
    queryKey: [`/api/deals/${dealId}`],
    enabled: !!dealId,
  });
  
  // Generate AI summary mutation
  const generateSummaryMutation = useMutation({
    mutationFn: async () => {
      setIsGeneratingSummary(true);
      return apiRequest("POST", `/api/deals/${dealId}/generate-summary`, {
        userId: CURRENT_USER.id,
      });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      setIsGeneratingSummary(false);
      
      // Invalidate the deal query to get updated data
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}`] });
      
      toast({
        title: "Summary Generated",
        description: "AI summary has been generated successfully.",
      });
      
      return data.aiSummary;
    },
    onError: (error) => {
      setIsGeneratingSummary(false);
      toast({
        title: "Error",
        description: `Failed to generate AI summary: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Generate market research report mutation
  const generateMarketResearchMutation = useMutation({
    mutationFn: async () => {
      setIsGeneratingReport(true);
      return apiRequest("POST", `/api/deals/${dealId}/generate-market-research`, {
        userId: CURRENT_USER.id,
      });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      setIsGeneratingReport(false);
      
      // Invalidate the deal query to get updated data
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}`] });
      
      toast({
        title: "Market Research Generated",
        description: "AI market research report has been generated successfully.",
      });
      
      return data.report;
    },
    onError: (error) => {
      setIsGeneratingReport(false);
      toast({
        title: "Error",
        description: `Failed to generate market research: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    deal,
    isDealLoading,
    isGeneratingSummary,
    isGeneratingReport,
    generateSummary: generateSummaryMutation.mutate,
    generateMarketResearch: generateMarketResearchMutation.mutate,
  };
}
