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
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    },
  });

  const onSubmit = (data) => {
    // confirmPassword already validated via the field's own `validate` rule,
    // so this manual check is not needed — react-hook-form won't call
    // onSubmit if that validation fails.
    // TODO: connect API
    console.log("Register submitted:", data);
  };

  return { ...form, onSubmit: form.handleSubmit(onSubmit) };
};