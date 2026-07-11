"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Which design variant's classes to apply. */
  variant?: "login" | "register";
  error?: string;
}

/**
 * Labeled text input matching the auth screens' markup:
 *   <div class="_social_*_form_input _mar_b14">
 *     <label class="_social_*_label _mar_b8">Email</label>
 *     <input class="form-control _social_*_input">
 *   </div>
 * Forwards refs (so React Hook Form's `register` works) to the input.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, variant = "login", error, className, id, ...rest },
  ref,
) {
  const inputClass = variant === "register" ? "_social_registration_input" : "_social_login_input";
  const labelClass = variant === "register" ? "_social_registration_label" : "_social_login_label";
  const wrapperClass =
    variant === "register" ? "_social_registration_form_input _mar_b14" : "_social_login_form_input _mar_b14";

  return (
    <div className={cn(wrapperClass, error && "_input_error")}>
      {label && (
        <label className={cn(labelClass, "_mar_b8")} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn("form-control", inputClass, className)}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error && <span className="_field_error">{error}</span>}
    </div>
  );
});
