"use client";

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
  const { push: toast } = useToast();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const payload = { email: data.email, password: data.password };

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

      <FormInput
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        required
        {...register("password")}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-2)" }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            toast("Password recovery feature coming soon!", "info");
          }}
          style={{ fontSize: "var(--text-sm)" }}
        >
          <Key size={14} style={{ marginRight: "4px", verticalAlign: "middle" }} />
          Lost your password?
        </button>
      </div>

      <FormSubmitButton isLoading={isSubmitting || loginMutation.isPending}>
        <LogIn size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        Sign In
      </FormSubmitButton>
    </form>
  );
}