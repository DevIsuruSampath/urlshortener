"use client";

import { forwardRef } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  register?: UseFormRegisterReturn;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, helperText, register, className = "", ...props }, ref) => {
    const checkboxId = props.id || `checkbox-${label.toLowerCase().replace(/\s+/g, "-")}`;
    
    return (
      <div className="form-group">
        <div className="form-checkbox-wrapper">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            className={`form-checkbox ${error ? "form-checkbox-error" : ""} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${checkboxId}-error` : helperText ? `${checkboxId}-helper` : undefined}
            {...register}
            {...props}
          />
          <label htmlFor={checkboxId} className="form-checkbox-label">
            {label}
            {props.required && <span className="form-required">*</span>}
          </label>
        </div>
        
        {helperText && !error && (
          <p id={`${checkboxId}-helper`} className="form-helper-text">
            {helperText}
          </p>
        )}
        
        {error && (
          <p id={`${checkboxId}-error`} className="form-error-text" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";