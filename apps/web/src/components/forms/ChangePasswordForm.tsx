"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";

import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/validation";
import { FormInput } from "@/components/ui/FormInput";
import { FormSubmitButton } from "@/components/ui/FormSubmitButton";
import { useChangePassword } from "@/lib/api-hooks";
import { useToast } from "@/components/ui/Toast";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const { push: toast } = useToast();
  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      
      toast("Password changed successfully!", "success");
      reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      toast("Failed to change password. Please try again.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-card">
      <div className="form-card-header">
        <h3 className="form-card-title">
          <Lock size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Change Password
        </h3>
        <p className="form-card-description">
          Update your account password. Use a strong, unique password.
        </p>
      </div>

      <FormInput
        label="Current Password"
        type="password"
        placeholder="••••••••"
        error={errors.current_password?.message}
        required
        {...register("current_password")}
      />

      <FormInput
        label="New Password"
        type="password"
        placeholder="••••••••"
        error={errors.new_password?.message}
        helperText="At least 8 characters"
        required
        {...register("new_password")}
      />

      <FormInput
        label="Confirm New Password"
        type="password"
        placeholder="••••••••"
        error={errors.confirm_password?.message}
        required
        {...register("confirm_password")}
      />

      <FormSubmitButton isLoading={isSubmitting || changePasswordMutation.isPending}>
        Change Password
      </FormSubmitButton>
    </form>
  );
}