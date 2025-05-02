import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Trash2, FileText, Link as LinkIcon, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CURRENT_USER } from "@/lib/constants";

const resourceSchema = z.object({
  name: z.string().min(1, "Resource name is required"),
  url: z.string().url("Must be a valid URL"),
  type: z.enum(["file", "link"]),
});

type FormValues = z.infer<typeof resourceSchema>;

interface ResourcesSectionProps {
  dealId: number;
}

export default function ResourcesSection({ dealId }: ResourcesSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<number | null>(null);

  // Fetch resources
  const { data: resources = [], isLoading } = useQuery({
    queryKey: [`/api/deals/${dealId}/resources`],
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: "",
      url: "",
      type: "link",
    },
  });

  // Add resource mutation
  const addMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiRequest("POST", `/api/deals/${dealId}/resources`, {
        ...values,
        userId: CURRENT_USER.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Resource Added",
        description: "Resource has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}/resources`] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete resource mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/resources/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Resource Deleted",
        description: "Resource has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}/resources`] });
      setResourceToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    form.reset({
      name: "",
      url: "",
      type: "link",
    });
    setIsAddDialogOpen(false);
  };

  const handleDeleteResource = (id: number) => {
    setResourceToDelete(id);
  };

  const confirmDeleteResource = () => {
    if (resourceToDelete !== null) {
      deleteMutation.mutate(resourceToDelete);
    }
  };

  const onSubmit = (values: FormValues) => {
    addMutation.mutate(values);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "file":
        return <FileText className="text-primary" />;
      case "link":
        return <LinkIcon className="text-primary" />;
      default:
        return <FileText className="text-primary" />;
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">Linked Resources</h3>
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Linked Resources</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Plus className="mr-2 h-3 w-3" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Resource</DialogTitle>
              <DialogDescription>
                Add a link to an external resource or file related to this deal.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Product Presentation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select resource type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="file">File</SelectItem>
                          <SelectItem value="link">External Link</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resource URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/presentation.pdf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addMutation.isPending}
                  >
                    {addMutation.isPending ? "Adding..." : "Add Resource"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {resources.length === 0 ? (
        <p className="text-sm text-muted-foreground">No resources linked yet.</p>
      ) : (
        <ul className="space-y-2">
          {resources.map((resource) => (
            <li 
              key={resource.id} 
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <div className="flex items-center">
                {getResourceIcon(resource.type)}
                <span className="text-sm ml-2">{resource.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(resource.url)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <AlertDialog 
                  open={resourceToDelete === resource.id} 
                  onOpenChange={(open) => !open && setResourceToDelete(null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{resource.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={confirmDeleteResource}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
