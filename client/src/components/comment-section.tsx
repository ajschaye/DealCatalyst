import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { CURRENT_USER } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentSectionProps {
  dealId: number;
}

export default function CommentSection({ dealId }: CommentSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: [`/api/deals/${dealId}/comments`],
  });

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (values: CommentFormValues) => {
      return apiRequest("POST", `/api/deals/${dealId}/comments`, {
        userId: CURRENT_USER.id,
        content: values.content,
      });
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}/comments`] });
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: CommentFormValues) => {
    setIsSubmitting(true);
    commentMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Comments</h3>
        {Array(2).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Comments</h3>
      
      <ScrollArea className="h-[250px] pr-4">
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-3 bg-muted rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={comment.user.avatarUrl} alt={comment.user.fullName} />
                      <AvatarFallback>
                        {comment.user.fullName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{comment.user.fullName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-line">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-3">
        <Textarea 
          {...form.register("content")}
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary mb-2" 
          rows={2} 
          placeholder="Add a comment..."
        />
        {form.formState.errors.content && (
          <p className="text-sm text-destructive mb-2">{form.formState.errors.content.message}</p>
        )}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
