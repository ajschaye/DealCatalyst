import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useDealForm } from "@/hooks/use-deal-form";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, User, RefreshCw, ChevronLeft } from "lucide-react";
import CommentSection from "@/components/comment-section";
import TagManager from "@/components/tag-manager";
import ResourcesSection from "@/components/resources-section";
import AiSummary from "@/components/ai-summary";
import AiMarketResearch from "@/components/ai-market-research";
import DealForm from "@/components/deal-form";
import { formatDistanceToNow } from "date-fns";

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const dealId = parseInt(id);
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  
  const { 
    deal, 
    isDealLoading, 
    isGeneratingSummary,
    isGeneratingReport,
    generateSummary,
    generateMarketResearch
  } = useDealForm(dealId);

  const handleBackToDashboard = () => {
    navigate("/");
  };

  if (isEditing) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(false)} 
            className="mr-2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold">Edit Deal</h1>
        </div>
        <DealForm 
          dealId={dealId} 
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  if (isDealLoading) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToDashboard} 
            className="mr-2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Skeleton className="h-8 w-1/4" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToDashboard} 
            className="mr-2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-semibold">Deal Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground">The requested deal could not be found.</p>
              <Button 
                variant="default" 
                onClick={handleBackToDashboard} 
                className="mt-4"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToDashboard} 
            className="mr-2"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-semibold">{deal.company}</h1>
        </div>
        <Button 
          variant="default" 
          onClick={() => setIsEditing(true)}
        >
          Edit Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  {deal.company}
                  <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStageClass(deal.stage)}`}>
                    {deal.stage}
                  </span>
                </CardTitle>
                {deal.website && (
                  <div className="text-sm text-muted-foreground mt-1">
                    <Globe className="inline h-4 w-4 mr-1" />
                    <a 
                      href={deal.website.startsWith('http') ? deal.website : `https://${deal.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {deal.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {deal.leadOwner && (
                  <div className="text-sm text-muted-foreground mt-1">
                    <User className="inline h-4 w-4 mr-1" />
                    Lead Owner: {deal.leadOwner.fullName}
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated {formatDistanceToNow(new Date(deal.lastUpdated), { addSuffix: true })}
              </div>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="ai">AI Tools</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <AiSummary 
                    summary={deal.aiSummary} 
                    isGenerating={isGeneratingSummary}
                    onRegenerate={() => generateSummary()}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Business Unit</h3>
                      <p className="text-sm">{deal.businessUnit?.name || "Not assigned"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Deal Type</h3>
                      <p className="text-sm">{deal.dealType}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Investment Size</h3>
                      <p className="text-sm">
                        {deal.investmentSize 
                          ? `$${deal.investmentSize.toLocaleString()}` 
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Internal Contact</h3>
                      <p className="text-sm">{deal.internalContact || "Not specified"}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Use Case</h3>
                    <p className="text-sm">{deal.useCase || "No use case specified"}</p>
                  </div>

                  <TagManager 
                    dealId={dealId} 
                    initialTags={deal.tags || []} 
                  />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Internal Notes</h3>
                    <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-line">
                      {deal.notes || "No notes added yet."}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-6">
                  <ResourcesSection dealId={dealId} />
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Custom Fields</h3>
                    {deal.customFieldValues && Object.keys(deal.customFieldValues).length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(deal.customFieldValues).map(([key, value]) => (
                          <div key={key}>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">{key}</h4>
                            <p className="text-sm">{value as string}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No custom fields.</p>
                    )}
                  </div>

                  {/* This would display any custom fields that were added through the admin interface */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Audit Trail</h3>
                    <p className="text-sm text-muted-foreground">
                      Created on {new Date(deal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="ai" className="space-y-6">
                  <AiSummary 
                    summary={deal.aiSummary} 
                    isGenerating={isGeneratingSummary}
                    onRegenerate={() => generateSummary()}
                  />
                  
                  <AiMarketResearch 
                    dealId={dealId}
                    reportLink={deal.aiMarketReportLink}
                    isGenerating={isGeneratingReport}
                    onGenerate={() => generateMarketResearch()}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentSection dealId={dealId} />
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button 
                variant="default" 
                onClick={() => setActiveTab("ai")}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate AI Analysis
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
