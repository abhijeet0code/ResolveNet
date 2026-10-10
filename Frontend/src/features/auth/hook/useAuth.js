
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  loginUser,
  loggedUser,
  registerUser,
} from "../state/authAction";

import { toast } from "react-toastify";

// LOGIN FORM HOOK
export const useLoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      identifier: "",
      password: "",
      keepSignedIn: false,
    },
  });

  const onSubmit = async (data) => {
    // Step 1: Login
    const result = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(result)) {
      // Step 2: Save token
      localStorage.setItem("token", result.payload.token);
      localStorage.setItem("tokenType", "Token");

      // Step 3: Get complete user data from backend
      const userResult = await dispatch(loggedUser());

      // Step 4: Only navigate after user data is loaded
      if (loggedUser.fulfilled.match(userResult)) {
        navigate("/dashboard");
        toast.success("Login successful!");
      } else {
        toast.error("Unable to load your profile. Please try again.");
      }
    } else {
      form.setError("password", {
        type: "manual",
        message: "Invalid credentials. Please try again.",
      });
    }
  };

  return {
    ...form,
    onSubmit: form.handleSubmit(onSubmit),
  };
};


// REGISTER FORM HOOK
export const useRegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const password = form.watch("password");

  const onSubmit = async (data) => {
    const payload = {
      email: data.email,
      password: data.password,
      confirm_password: data.confirmPassword,
    };

    const result = await dispatch(registerUser(payload));

    if (registerUser.fulfilled.match(result)) {
      toast.success(
        "Registration successful! Please check your email to verify your account."
      );

      navigate("/login");
    } else {
      form.setError("email", {
        type: "manual",
        message:
          result.payload?.confirm_password?.[0] ||
          result.payload?.email?.[0] ||
          "Registration failed. Try a different email.",
      });
    }
  };

  return {
    ...form,
    onSubmit: form.handleSubmit(onSubmit),
    password,
  };
};

