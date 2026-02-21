"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Key } from "lucide-react";

import { loginSchema, type LoginFormValues } from "@/lib/validation";
import { FormInput } from "@/components/ui/FormInput";
import { FormSubmitButton } from "@/components/ui/FormSubmitButton";
import { useLogin } from "@/lib/api-hooks";
import { useToast } from "@/components/ui/Toast";

interface LoginFormProps {
  // Optional callback for custom success handling
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const { push: toast } = useToast();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      recovery_code: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Clean up data based on login method
      const payload = useRecoveryCode
        ? { email: data.email, recovery_code: data.recovery_code }
        : { email: data.email, password: data.password };

      await loginMutation.mutateAsync(payload);
      
      toast("Login successful!", "success");
      
      // Redirect to admin dashboard on success
      window.location.href = '/';
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Show more specific error messages
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (error?.status === 401) {
        errorMessage = "Invalid email or password.";
      } else if (error?.status === 403) {
        errorMessage = "Admin setup is required before login.";
      } else if (error?.status === 429) {
        errorMessage = "Too many login attempts. Please wait and try again.";
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
          <LogIn size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Admin Login
        </h3>
        <p className="form-card-description">
          Sign in to access the admin dashboard.
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

      {!useRecoveryCode ? (
        <>
          <FormInput
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            required
            {...register("password")}
          />
          
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setUseRecoveryCode(true)}
            style={{ marginTop: "var(--space-2)", fontSize: "var(--text-sm)" }}
          >
            <Key size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />
            Use recovery code instead
          </button>
        </>
      ) : (
        <>
          <FormInput
            label="Recovery Code"
            placeholder="XXXXXX"
            error={errors.recovery_code?.message}
            helperText="Enter your 6-digit recovery code"
            required
            {...register("recovery_code")}
          />
          
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setUseRecoveryCode(false)}
            style={{ marginTop: "var(--space-2)", fontSize: "var(--text-sm)" }}
          >
            Use password instead
          </button>
        </>
      )}

      <FormSubmitButton isLoading={isSubmitting || loginMutation.isPending}>
        Sign In
      </FormSubmitButton>
    </form>
  );
}