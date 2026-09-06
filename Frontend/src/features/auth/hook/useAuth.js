// src/hooks/useAuth.js
import { useForm } from "react-hook-form";

export const useLoginForm = () => {
  const form = useForm({
    defaultValues: {
      identifier: "",
      password: "",
      keepSignedIn: false,
    },
  });

  const onSubmit = (data) => {
    // TODO: connect API
    console.log("Login submitted:", data);
  };

  return { ...form, onSubmit: form.handleSubmit(onSubmit) };
};

export const useRegisterForm = () => {
  const form = useForm({
    defaultValues: {
      username: "",
      identifier: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const onSubmit = (data) => {
    if (data.password !== data.confirmPassword) {
      form.setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }
    // TODO: connect API
    console.log("Register submitted:", data);
  };

  return { ...form, onSubmit: form.handleSubmit(onSubmit) };
};