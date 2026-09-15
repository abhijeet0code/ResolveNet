// Login.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Smartphone, ArrowRight } from "lucide-react";
import { useLoginForm } from "../hook/useAuth";
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


const Login = () => {
  const {
    register,
    formState: { errors },
    onSubmit,
  } = useLoginForm();

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-4xl bg-surface border border-border rounded-2xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Log In</h1>
              <p className="text-xs text-text-secondary">
                Access your account to continue
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input
              label="Email/Mobile Number"
              icon={Mail}
              placeholder="Enter your email or mobile number"
              error={errors.identifier}
              registration={register("identifier", {
                required: "This field is required",
              })}
            />

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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  {...register("keepSignedIn")}
                  className="w-4 h-4 accent-accent rounded cursor-pointer"
                />
                Keep me signed in
              </label>
              <button
                type="button"
                className="text-accent font-medium hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button type="submit" variant="primary" className=" bg-primary-light !w-full">
              Log In
            </Button>

            <p className="text-xs text-text-muted text-center pt-2">
              By logging in, you agree to our{" "}
              <span className="text-accent font-medium cursor-pointer">
                Terms & Conditions
              </span>{" "}
              and{" "}
              <span className="text-accent font-medium cursor-pointer">
                Privacy Policy.
              </span>
            </p>
          </form>
        </div>

        {/* Right: Alt options */}
        <div className="flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted whitespace-nowrap">
              or continue with
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 text-sm font-semibold text-text-primary bg-surface hover:bg-secondary transition-colors duration-200 mb-3 cursor-pointer"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 text-sm font-semibold text-text-primary bg-surface hover:bg-secondary transition-colors duration-200 mb-8 cursor-pointer"
          >
            <Smartphone size={18} />
            Continue with Phone Number
          </button>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              Create an account to get started
            </span>
            <ArrowRight size={16} className="text-text-muted mx-2 shrink-0" />
            <NavLink to="/register">
              <Button variant="primary" className="!w-auto !px-4 !py-2 bg-primary-light text-sm">
                Sign Up
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;