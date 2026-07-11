"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginValues } from "@/lib/schemas/auth.schema";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/utils/errors";

/**
 * /login - recreates login.html. Email/password via React Hook Form + Zod;
 * the submit handler delegates to the auth context (which stores the JWT).
 */
export default function LoginPage() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      router.push("/feed");
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        for (const [field, messages] of Object.entries(err.fieldErrors)) {
          const message = Array.isArray(messages) ? messages[0] : messages;
          if (["email", "password"].includes(field)) {
            setError(field as "email" | "password", { message });
          }
        }
        setFormError(err.message);
      } else {
        setFormError(err instanceof Error ? err.message : "Login failed");
      }
    }
  });

  return (
    <section className="_social_login_wrapper _layout_main_wrapper">
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

      <div className="_social_login_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_login_left">
                <div className="_social_login_left_image">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/images/login.png" alt="Login" className="_left_img" />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_login_content">
                <div className="_social_login_left_logo _mar_b28">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/images/logo.svg" alt="Buddy Script" className="_left_logo" />
                </div>
                <p className="_social_login_content_para _mar_b8">Welcome back</p>
                <h4 className="_social_login_content_title _titl4 _mar_b50">Login to your account</h4>

                <button type="button" className="_social_login_content_btn _mar_b40" onClick={() => setFormError("Social login is not configured in this demo.")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/images/google.svg" alt="" className="_google_img" /> <span>Or sign-in with google</span>
                </button>

                <div className="_social_login_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                <form className="_social_login_form" onSubmit={onSubmit} noValidate>
                  <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <Input
                        id="login-email"
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
                        id="login-password"
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        error={errors.password?.message}
                        {...register("password")}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                      <div className="form-check _social_login_form_check">
                        <input
                          className="form-check-input _social_login_form_check_input"
                          type="radio"
                          name="remember"
                          id="flexRadioDefault2"
                          defaultChecked
                        />
                        <label className="form-check-label _social_login_form_check_label" htmlFor="flexRadioDefault2">
                          Remember me
                        </label>
                      </div>
                    </div>
                    <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                      <div className="_social_login_form_left">
                        <p className="_social_login_form_left_para">Forgot password?</p>
                      </div>
                    </div>
                  </div>

                  {formError && (
                    <div className="_social_login_form_error" role="alert">
                      {formError}
                    </div>
                  )}

                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_login_form_btn _mar_t40 _mar_b60">
                        <Button
                          type="submit"
                          className="_social_login_form_btn_link _btn1"
                          loading={isSubmitting || loading}
                        >
                          Login now
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_login_bottom_txt">
                      <p className="_social_login_bottom_txt_para">
                        Dont have an account?{" "}
                        <Link href="/register">Create New Account</Link>
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
