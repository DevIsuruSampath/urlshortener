"use client";

import { forwardRef } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  register?: UseFormRegisterReturn;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helperText, register, className = "", ...props }, ref) => {
    const textareaId = props.id || `textarea-${label.toLowerCase().replace(/\s+/g, "-")}`;
    
    return (
      <div className="form-group">
        <label htmlFor={textareaId} className="form-label">
          {label}
          {props.required && <span className="form-required">*</span>}
        </label>
        
        <textarea
          id={textareaId}
          ref={ref}
          className={`form-textarea ${error ? "form-textarea-error" : ""} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          rows={props.rows || 4}
          {...register}
          {...props}
        />
        
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="form-helper-text">
            {helperText}
          </p>
        )}
        
        {error && (
          <p id={`${textareaId}-error`} className="form-error-text" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";