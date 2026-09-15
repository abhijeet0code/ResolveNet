// Register.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { UserPlus, User, Mail, Lock, Smartphone, Phone } from "lucide-react";
import { useRegisterForm } from "../hook/useAuth"; 
import Button from "../../../shared/button/Button";
import Input from "../../../shared/input/Input";
import { GoogleIcon } from "./components/AuthComponent";
import { supabase } from "../../../lib/supabase"

const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error) {
        console.error(error.message);
    }
};



const Register = () => {
  const {
    register,
    watch,
    formState: { errors },
    onSubmit,
  } = useRegisterForm();

  const password = watch("password");

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-4xl bg-surface border border-border rounded-2xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <UserPlus size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-accent">Sign Up</h1>
              <p className="text-xs text-text-secondary">
                Create your account to get started
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <Input
              label="Username"
              icon={User}
              placeholder="Enter your username"
              error={errors.username}
              registration={register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              })}
            />

            {/* Mobile Number */}
            <Input
              label="Mobile Number"
              icon={Phone}
              type="tel"
              placeholder="Enter your mobile number"
              error={errors.mobile}
              registration={register("mobile", {
                required: "Mobile number is required",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              })}
            />

            {/* Email */}
            <Input
              label="Email"
              icon={Mail}
              type="email"
              placeholder="Enter your email"
              error={errors.email}
              registration={register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />

            {/* Password */}
            <Input
              label="Password"
              icon={Lock}
              type="password"
              placeholder="Create password"
              error={errors.password}
              registration={register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              icon={Lock}
              type="password"
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              registration={register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />

            {/* Terms */}
            <label className="flex items-start gap-2 text-sm text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                {...register("agreeTerms", {
                  required: "You must agree to continue",
                })}
                className="w-4 h-4 mt-0.5 accent-accent rounded cursor-pointer shrink-0"
              />
              <span>
                I agree to the{" "}
                <span className="text-accent font-medium">
                  Terms & Conditions
                </span>{" "}
                and{" "}
                <span className="text-accent font-medium">
                  Privacy Policy.
                </span>
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-xs text-error -mt-2">
                {errors.agreeTerms.message}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              className="!w-full !bg-primary-light hover:!opacity-90"
            >
              Sign Up
            </Button>
          </form>
        </div>

        {/* Right: Alternative Options */}
        <div className="flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted whitespace-nowrap">
              or continue with
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 text-sm font-semibold text-text-primary bg-surface hover:bg-secondary transition-colors duration-200 mb-3 cursor-pointer"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Phone */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 text-sm font-semibold text-text-primary bg-surface hover:bg-secondary transition-colors duration-200 mb-8 cursor-pointer"
          >
            <Smartphone size={18} />
            Continue with Phone Number
          </button>

          {/* Login */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-text-secondary">
              Already have an account?
            </span>
            <NavLink to="/login">
              <Button
                variant="primary"
                className="!w-auto !px-4 !py-2 bg-primary-light text-sm"
              >
                Log In
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;