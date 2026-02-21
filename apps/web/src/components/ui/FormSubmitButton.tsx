"use client";

import { Button } from "./Button";
import { Loader2 } from "lucide-react";

interface FormSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function FormSubmitButton({
  isLoading = false,
  loadingText = "Submitting...",
  children,
  className = "",
  disabled,
  ...props
}: FormSubmitButtonProps) {
  return (
    <Button
      type="submit"
      className={`form-submit-button ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="form-submit-loader" size={18} />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}