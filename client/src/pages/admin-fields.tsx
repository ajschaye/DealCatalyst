import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { PenLine, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CUSTOM_FIELD_TYPES } from "@/lib/constants";
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

const customFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  type: z.string().min(1, "Field type is required"),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof customFieldSchema>;

export default function AdminFields() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditingField, setIsEditingField] = useState<number | null>(null);
  const [fieldToDelete, setFieldToDelete] = useState<number | null>(null);
  const [isEnumField, setIsEnumField] = useState(false);
  const [enumOptions, setEnumOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");

  // Fetch custom fields
  const { data: customFields = [], isLoading } = useQuery({
    queryKey: ["/api/custom-fields"],
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: {
      name: "",
      type: "text",
      required: false,
      options: [],
    },
  });

  // Add/Edit field mutation
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Format the payload
      const payload = {
        ...values,
        options: isEnumField ? enumOptions : undefined,
      };

      if (isEditingField) {
        // Update field
        return apiRequest("PUT", `/api/custom-fields/${isEditingField}`, payload);
      } else {
        // Create field
        return apiRequest("POST", "/api/custom-fields", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditingField ? "Field Updated" : "Field Added",
        description: isEditingField
          ? "Custom field has been updated successfully."
          : "New custom field has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
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

  // Delete field mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/custom-fields/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Field Deleted",
        description: "Custom field has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-fields"] });
      setFieldToDelete(null);
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
      type: "text",
      required: false,
      options: [],
    });
    setIsEnumField(false);
    setEnumOptions([]);
    setNewOption("");
    setIsAddDialogOpen(false);
    setIsEditingField(null);
  };

  const handleDeleteField = (id: number) => {
    setFieldToDelete(id);
  };

  const confirmDeleteField = () => {
    if (fieldToDelete !== null) {
      deleteMutation.mutate(fieldToDelete);
    }
  };

  const handleEditField = (field: any) => {
    setIsEditingField(field.id);
    
    // Check if field is an enum type
    const isEnum = field.type === "enum";
    setIsEnumField(isEnum);
    
    // Set enum options if available
    if (isEnum && field.options) {
      setEnumOptions(field.options);
    } else {
      setEnumOptions([]);
    }
    
    // Set form values
    form.reset({
      name: field.name,
      type: field.type,
      required: field.required,
      options: isEnum ? field.options : [],
    });
    
    setIsAddDialogOpen(true);
  };

  const handleAddOption = () => {
    if (newOption.trim() && !enumOptions.includes(newOption.trim())) {
      setEnumOptions([...enumOptions, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (option: string) => {
    setEnumOptions(enumOptions.filter((opt) => opt !== option));
  };

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  const handleTypeChange = (value: string) => {
    form.setValue("type", value);
    setIsEnumField(value === "enum");
    
    // Reset options if not enum
    if (value !== "enum") {
      setEnumOptions([]);
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Custom Field Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Field
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditingField ? "Edit Custom Field" : "Add New Custom Field"}
              </DialogTitle>
              <DialogDescription>
                {isEditingField 
                  ? "Update the properties of this custom field."
                  : "Create a new custom field that will be available for all deals."
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Strategic Fit" {...field} />
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
                      <FormLabel>Field Type</FormLabel>
                      <Select
                        onValueChange={(value) => handleTypeChange(value)}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select field type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CUSTOM_FIELD_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Required Field</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Make this a required field for all deals
                        </p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEnumField && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Option value"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddOption}
                      >
                        Add Option
                      </Button>
                    </div>
                    {enumOptions.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {enumOptions.map((option) => (
                          <Badge
                            key={option}
                            variant="outline"
                            className="pr-1.5"
                          >
                            {option}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1 ml-1"
                              onClick={() => handleRemoveOption(option)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Add at least one option for the dropdown field.
                      </p>
                    )}
                  </div>
                )}

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
                    disabled={mutation.isPending || (isEnumField && enumOptions.length === 0)}
                  >
                    {mutation.isPending
                      ? "Saving..."
                      : isEditingField
                      ? "Update Field"
                      : "Add Field"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Fields</CardTitle>
        </CardHeader>
        <CardContent>
          {customFields.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                No custom fields have been created yet.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Field
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customFields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>{field.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CUSTOM_FIELD_TYPES.find(t => t.value === field.type)?.label || field.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {field.required ? (
                        <Badge variant="default" className="bg-accent text-white">Required</Badge>
                      ) : (
                        <Badge variant="outline">Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {field.type === "enum" && field.options?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {field.options.slice(0, 3).map((option, idx) => (
                            <Badge key={idx} variant="secondary">
                              {option}
                            </Badge>
                          ))}
                          {field.options.length > 3 && (
                            <Badge variant="secondary">
                              +{field.options.length - 3} more
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditField(field)}
                        className="mr-1"
                      >
                        <PenLine className="h-4 w-4" />
                      </Button>
                      <AlertDialog open={fieldToDelete === field.id} onOpenChange={(open) => !open && setFieldToDelete(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteField(field.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Custom Field</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the "{field.name}" field? This action cannot be undone and
                              will remove this field from all deals.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={confirmDeleteField}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
