import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../state/authAction";

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
    const result = await dispatch(loginUser(data));

    if (loginUser.fulfilled.match(result)) {
      localStorage.setItem("token", result.payload.token);
      navigate("/dashboard");
    } else {
      form.setError("password", {
        type: "manual",
        message: "Invalid credentials. Please try again.",
      });
    }
  };

  return { ...form, onSubmit: form.handleSubmit(onSubmit) };
};

// REGISTER FORM HOOK (FIXED)
export const useRegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const password = form.watch("password");

  const onSubmit = async (data) => {
    // Backend expected keys pass ho rahi hain
    const payload = {
      username: data.username,
      email: data.email,
      phone_number: data.mobile,
      password: data.password,
      confirm_password: data.confirmPassword, // Added missing field
    };

    const result = await dispatch(registerUser(payload));

    if (registerUser.fulfilled.match(result)) {
      navigate("/login");
    } else {
      form.setError("email", {
        type: "manual",
        message:
          result.payload?.confirm_password?.[0] ||
          result.payload?.username?.[0] ||
          result.payload?.email?.[0] ||
          "Registration failed. Try a different username/email.",
      });
    }
  };

  return { ...form, onSubmit: form.handleSubmit(onSubmit), password };
};