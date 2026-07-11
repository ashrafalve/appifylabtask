"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterValues } from "@/lib/schemas/auth.schema";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/utils/errors";

/**
 * /register - recreates registration.html.
 *
 * The backend `RegisterDto` requires `firstName` + `lastName`, so (unlike the
 * static source HTML) we include those two fields. Email / password / repeat
 * / terms follow the design exactly.
 */
export default function RegisterPage() {
  const { register: doRegister, loading } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false as unknown as true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await doRegister({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      router.push("/feed");
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        const map: Record<string, "firstName" | "lastName" | "email" | "password" | "confirmPassword"> = {
          firstName: "firstName",
          lastName: "lastName",
          email: "email",
          password: "password",
          confirmPassword: "confirmPassword",
        };
        for (const [field, messages] of Object.entries(err.fieldErrors)) {
          const target = map[field];
          if (target) {
            const message = Array.isArray(messages) ? messages[0] : messages;
            setError(target, { message });
          }
        }
        setFormError(err.message);
      } else {
        setFormError(err instanceof Error ? err.message : "Registration failed");
      }
    }
  });

  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
      <div className="_shape_one">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/images/shape1.svg" alt="" className="_shape_img" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/images/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/images/shape2.svg" alt="" className="_shape_img" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/images/dark_shape1.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>
      <div className="_shape_three">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/images/shape3.svg" alt="" className="_shape_img" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/images/dark_shape2.svg" alt="" className="_dark_shape _dark_shape_opacity" />
      </div>

      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/images/registration.png" alt="Registration" />
                </div>
                <div className="_social_registration_right_image_dark">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/images/registration1.png" alt="Registration" />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                <div className="_social_registration_right_logo _mar_b28">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/images/logo.svg" alt="Buddy Script" className="_right_logo" />
                </div>
                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>

                <button type="button" className="_social_registration_content_btn _mar_b40" onClick={() => setFormError("Social sign-up is not configured in this demo.")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/images/google.svg" alt="" className="_google_img" /> <span>Register with google</span>
                </button>

                <div className="_social_registration_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                <form className="_social_registration_form" onSubmit={onSubmit} noValidate>
                  <div className="row">
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <Input
                        variant="register"
                        id="reg-first"
                        label="First Name"
                        placeholder="Jane"
                        autoComplete="given-name"
                        error={errors.firstName?.message}
                        {...register("firstName")}
                      />
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <Input
                        variant="register"
                        id="reg-last"
                        label="Last Name"
                        placeholder="Doe"
                        autoComplete="family-name"
                        error={errors.lastName?.message}
                        {...register("lastName")}
                      />
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <Input
                        variant="register"
                        id="reg-email"
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email")}
                      />
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <Input
                        variant="register"
                        id="reg-password"
                        label="Password"
                        type="password"
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        error={errors.password?.message}
                        {...register("password")}
                      />
                    </div>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <Input
                        variant="register"
                        id="reg-confirm"
                        label="Repeat Password"
                        type="password"
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        error={errors.confirmPassword?.message}
                        {...register("confirmPassword")}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                      <div className="form-check _social_registration_form_check">
                        <input
                          className="form-check-input _social_registration_form_check_input"
                          type="checkbox"
                          id="termsCheck"
                          {...register("acceptTerms")}
                        />
                        <label className="form-check-label _social_registration_form_check_label" htmlFor="termsCheck">
                          I agree to terms &amp; conditions
                        </label>
                      </div>
                      {errors.acceptTerms && (
                        <span className="_field_error">{errors.acceptTerms.message}</span>
                      )}
                    </div>
                  </div>

                  {formError && (
                    <div className="_social_login_form_error" role="alert">
                      {formError}
                    </div>
                  )}

                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                        <Button
                          type="submit"
                          className="_social_registration_form_btn_link _btn1"
                          loading={isSubmitting || loading}
                        >
                          Create Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account?{" "}
                        <Link href="/login">Sign in</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
