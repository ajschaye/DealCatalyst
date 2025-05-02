import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DEAL_STAGES, DEAL_TYPES, CURRENT_USER } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  internalContact: z.string().optional(),
  businessUnitId: z.string().optional(),
  dealType: z.string().min(1, "Deal type is required"),
  investmentSize: z.string().optional(),
  useCase: z.string().optional(),
  leadOwnerId: z.string().optional(),
  stage: z.string().min(1, "Stage is required"),
  notes: z.string().optional(),
  tagIds: z.array(z.number()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DealFormProps {
  dealId?: number;
  onSuccess?: () => void;
}

export default function DealForm({ dealId, onSuccess }: DealFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deal if editing
  const { data: deal } = useQuery({
    queryKey: [`/api/deals/${dealId}`],
    enabled: !!dealId,
  });

  // Fetch business units
  const { data: businessUnits = [] } = useQuery({
    queryKey: ["/api/business-units"],
  });

  // Fetch tags
  const { data: tags = [] } = useQuery({
    queryKey: ["/api/tags"],
  });

  // Fetch users for the lead owner dropdown
  const { data: users = [CURRENT_USER] } = useQuery({
    queryKey: ["/api/users"],
    placeholderData: [CURRENT_USER],
  });

  // Setup form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      website: "",
      internalContact: "",
      businessUnitId: "",
      dealType: "",
      investmentSize: "",
      useCase: "",
      leadOwnerId: CURRENT_USER.id.toString(),
      stage: "Initial Contact",
      notes: "",
      tagIds: [],
    },
  });

  // Update form when deal data is loaded
  useEffect(() => {
    if (deal) {
      form.reset({
        company: deal.company,
        website: deal.website || "",
        internalContact: deal.internalContact || "",
        businessUnitId: deal.businessUnitId ? deal.businessUnitId.toString() : "",
        dealType: deal.dealType,
        investmentSize: deal.investmentSize ? deal.investmentSize.toString() : "",
        useCase: deal.useCase || "",
        leadOwnerId: deal.leadOwnerId ? deal.leadOwnerId.toString() : "",
        stage: deal.stage,
        notes: deal.notes || "",
        tagIds: deal.tags?.map(tag => tag.id) || [],
      });
    }
  }, [deal, form]);

  // Create or update deal mutation
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        investmentSize: values.investmentSize ? parseInt(values.investmentSize) : undefined,
        businessUnitId: values.businessUnitId ? parseInt(values.businessUnitId) : undefined,
        leadOwnerId: values.leadOwnerId ? parseInt(values.leadOwnerId) : undefined,
        userId: CURRENT_USER.id, // For activity logging
      };

      if (dealId) {
        // Update existing deal
        return apiRequest("PUT", `/api/deals/${dealId}`, payload);
      } else {
        // Create new deal
        return apiRequest("POST", "/api/deals", payload);
      }
    },
    onSuccess: () => {
      toast({
        title: dealId ? "Deal Updated" : "Deal Created",
        description: dealId
          ? "The deal has been updated successfully."
          : "The deal has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      if (dealId) {
        queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}`] });
      }
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dealId ? "Edit Deal" : "New Deal"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internalContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Internal contact name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leadOwnerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Owner</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.fullName}
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
                name="businessUnitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Unit</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessUnits.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.name}
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
                name="dealType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select deal type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEAL_TYPES.map((type) => (
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
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Stage</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select deal stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEAL_STAGES.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            {stage.label}
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
                name="investmentSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Size</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Investment amount" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>Optional - In USD</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="useCase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Use Case</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe the use case" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any internal notes about this deal" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onSuccess ? onSuccess() : form.reset()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving..." : (dealId ? "Update Deal" : "Create Deal")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
