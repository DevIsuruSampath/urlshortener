"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Key } from "lucide-react";

import { setupSchema, type SetupFormValues } from "@/lib/validation";
import { FormInput } from "@/components/ui/FormInput";
import { FormSubmitButton } from "@/components/ui/FormSubmitButton";
import { useSetup } from "@/lib/api-hooks";
import { useToast } from "@/components/ui/Toast";

export function SetupForm() {
  const { push: toast } = useToast();
  const setupMutation = useSetup();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: SetupFormValues) => {
    try {
      await setupMutation.mutateAsync(data);
      
      toast("Admin account created successfully! Please login.", "success");
      
      // Redirect to login page after successful setup
      window.location.href = '/login';
    } catch (error: any) {
      console.error("Setup failed:", error);
      
      let errorMessage = "Failed to create admin account.";
      
      if (error?.status === 400) {
        errorMessage = error.message || "Invalid setup data.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast(errorMessage, "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-card">
      <div className="form-card-header">
        <h3 className="form-card-title">
          <UserPlus size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Initial Admin Setup
        </h3>
        <p className="form-card-description">
          Create the first admin account for the URL shortener.
        </p>
      </div>

      <FormInput
        label="Email"
        type="email"
        placeholder="admin@example.com"
        error={errors.email?.message}
        required
        {...register("email")}
      />

      <FormInput
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        helperText="At least 8 characters"
        required
        {...register("password")}
      />

      <FormInput
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        error={errors.confirm_password?.message}
        required
        {...register("confirm_password")}
      />

      <div className="form-helper-text" style={{ marginTop: "var(--space-2)" }}>
        <Key size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />
        <strong>Important:</strong> Save your recovery codes when they appear. You'll need them if you forget your password.
      </div>

      <FormSubmitButton isLoading={isSubmitting || setupMutation.isPending}>
        Create Admin Account
      </FormSubmitButton>
    </form>
  );
}