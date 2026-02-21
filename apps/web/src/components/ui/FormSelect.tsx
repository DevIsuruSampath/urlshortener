"use client";

import { forwardRef } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  register?: UseFormRegisterReturn;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helperText, options, register, className = "", ...props }, ref) => {
    const selectId = props.id || `select-${label.toLowerCase().replace(/\s+/g, "-")}`;
    
    return (
      <div className="form-group">
        <label htmlFor={selectId} className="form-label">
          {label}
          {props.required && <span className="form-required">*</span>}
        </label>
        
        <select
          id={selectId}
          ref={ref}
          className={`form-select ${error ? "form-select-error" : ""} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...register}
          {...props}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="form-helper-text">
            {helperText}
          </p>
        )}
        
        {error && (
          <p id={`${selectId}-error`} className="form-error-text" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";