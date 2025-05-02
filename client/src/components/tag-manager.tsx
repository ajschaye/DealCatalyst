import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";

interface Tag {
  id: number;
  name: string;
}

interface TagManagerProps {
  dealId: number;
  initialTags?: Tag[];
}

export default function TagManager({ dealId, initialTags = [] }: TagManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags);

  // Fetch all available tags
  const { data: allTags = [] } = useQuery({
    queryKey: ["/api/tags"],
  });

  // Update selectedTags when initialTags changes (e.g. after refetching deal data)
  useEffect(() => {
    setSelectedTags(initialTags);
  }, [initialTags]);

  // Create new tag mutation
  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/tags", { name });
    },
    onSuccess: async (res) => {
      const newTag = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      
      // Add the new tag to the deal
      addTagToDealMutation.mutate(newTag.id);
      setNewTagName("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create tag: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add tag to deal mutation
  const addTagToDealMutation = useMutation({
    mutationFn: async (tagId: number) => {
      return apiRequest("POST", `/api/deals/${dealId}/tags/${tagId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}`] });
      setIsAddDialogOpen(false);
      toast({
        title: "Tag Added",
        description: "Tag has been added to the deal.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add tag: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Remove tag from deal mutation
  const removeTagMutation = useMutation({
    mutationFn: async (tagId: number) => {
      return apiRequest("DELETE", `/api/deals/${dealId}/tags/${tagId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}`] });
      toast({
        title: "Tag Removed",
        description: "Tag has been removed from the deal.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove tag: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTagMutation.mutate(newTagName.trim());
    }
  };

  const handleAddExistingTag = (tag: Tag) => {
    if (!selectedTags.some(t => t.id === tag.id)) {
      addTagToDealMutation.mutate(tag.id);
    }
  };

  const handleRemoveTag = (tagId: number) => {
    removeTagMutation.mutate(tagId);
  };

  const availableTags = allTags.filter(
    (tag) => !selectedTags.some((selectedTag) => selectedTag.id === tag.id)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="mr-2 h-3 w-3" />
              Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Tags</DialogTitle>
              <DialogDescription>
                Add existing tags or create a new one.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Select Existing Tags</h4>
                <Command>
                  <CommandInput placeholder="Search tags..." />
                  <CommandList>
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {availableTags.length > 0 ? (
                        availableTags.map((tag) => (
                          <CommandItem
                            key={tag.id}
                            onSelect={() => handleAddExistingTag(tag)}
                            className="cursor-pointer"
                          >
                            {tag.name}
                          </CommandItem>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground p-2">
                          No more tags available to add.
                        </p>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Create New Tag</h4>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="New tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || createTagMutation.isPending}
                  >
                    {createTagMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <Badge 
              key={tag.id} 
              variant="outline"
              className="bg-primary bg-opacity-10 text-primary"
            >
              {tag.name}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveTag(tag.id)}
                className="h-auto p-0 ml-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No tags added.</p>
        )}
      </div>
    </div>
  );
}
