import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

interface AiSummaryProps {
  summary?: string | null;
  isGenerating: boolean;
  onRegenerate: () => void;
}

export default function AiSummary({ summary, isGenerating, onRegenerate }: AiSummaryProps) {
  if (isGenerating) {
    return (
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">AI Summary</h3>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center py-4">
              <div className="flex flex-col items-center">
                <RefreshCw className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Generating AI summary...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">AI Summary</h3>
      <div className="p-3 bg-muted rounded-md text-sm">
        {summary ? (
          <p>{summary}</p>
        ) : (
          <p className="text-muted-foreground italic">
            No AI summary available. Generate one using the button below.
          </p>
        )}
      </div>
      <div className="mt-2 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          className="text-primary"
        >
          <RefreshCw className="mr-1 h-3 w-3" />
          {summary ? "Regenerate Summary" : "Generate Summary"}
        </Button>
      </div>
    </div>
  );
}
