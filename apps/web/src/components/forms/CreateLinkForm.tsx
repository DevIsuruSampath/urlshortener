"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as LinkIcon } from "lucide-react";

import { linkSchema, type LinkFormValues } from "@/lib/validation";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormSubmitButton } from "@/components/ui/FormSubmitButton";
import { useLinkCreate } from "@/lib/api-hooks";
import { useToast } from "@/components/ui/Toast";

interface CreateLinkFormProps {
  onSuccess?: () => void;
}

export function CreateLinkForm({ onSuccess }: CreateLinkFormProps) {
  const { push: toast } = useToast();
  const createLinkMutation = useLinkCreate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      destination: "",
      customAlias: "",
      tier: "free",
    },
  });

  const onSubmit = async (data: LinkFormValues) => {
    try {
      await createLinkMutation.mutateAsync(data);
      
      toast("Link created successfully!", "success");
      reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to create link:", error);
      toast("Failed to create link. Please try again.", "error");
    }
  };

  const tierOptions = [
    { value: "free", label: "Free" },
    { value: "premium", label: "Premium" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-card">
      <div className="form-card-header">
        <h3 className="form-card-title">
          <LinkIcon size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Create New Link
        </h3>
        <p className="form-card-description">
          Create a shortened URL that redirects to your destination.
        </p>
      </div>

      <div className="form-grid">
        <FormInput
          label="Destination URL"
          placeholder="https://example.com"
          error={errors.destination?.message}
          helperText="The full URL you want to shorten"
          required
          {...register("destination")}
        />

        <FormInput
          label="Custom Alias (Optional)"
          placeholder="my-custom-link"
          error={errors.customAlias?.message}
          helperText="Custom short code (letters, numbers, hyphens, underscores)"
          {...register("customAlias")}
        />

        <FormSelect
          label="Tier"
          options={tierOptions}
          error={errors.tier?.message}
          helperText="Free for basic links, Premium for advanced features"
          {...register("tier")}
        />
      </div>

      <FormSubmitButton isLoading={isSubmitting || createLinkMutation.isPending}>
        Create Link
      </FormSubmitButton>
    </form>
  );
}