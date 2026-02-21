"use client";

import { forwardRef } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  register?: UseFormRegisterReturn;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, register, className = "", ...props }, ref) => {
    const inputId = props.id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
    
    return (
      <div className="form-group">
        <label htmlFor={inputId} className="form-label">
          {label}
          {props.required && <span className="form-required">*</span>}
        </label>
        
        <input
          id={inputId}
          ref={ref}
          className={`form-input ${error ? "form-input-error" : ""} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...register}
          {...props}
        />
        
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="form-helper-text">
            {helperText}
          </p>
        )}
        
        {error && (
          <p id={`${inputId}-error`} className="form-error-text" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";