import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Camera, User, X } from "lucide-react";
import axiosInstance from "../../config/axiosInstance"; // adjust to your actual path
import { loggedUser } from "../../features/auth/state/authAction"; // adjust to your actual path

const steps = [
  { key: "welcome", kind: "intro" },
  {
    key: "full_name",
    kind: "field",
    field: "full_name",
    title: "What's Your Name?",
    subtitle: "Let's get started.",
    placeholder: "Enter your full name",
    required: true,
  },
  {
    key: "username",
    kind: "field",
    field: "username",
    title: "Create Your Username",
    subtitle: "This will be your identity on ResolveNet.",
    placeholder: "Enter username",
    required: true,
  },
  {
    key: "phone",
    kind: "field",
    field: "phone",
    title: "Enter Your Mobile Number",
    subtitle: "We'll use this to keep your account secure.",
    placeholder: "Enter mobile number",
    required: true,
  },
  {
    key: "city",
    kind: "field",
    field: "city",
    title: "Which City Are You In?",
    subtitle: "Helps us show issues relevant to you.",
    placeholder: "Enter your city",
    required: true,
  },
  {
    key: "state",
    kind: "field",
    field: "state",
    title: "Which State?",
    subtitle: "Just to narrow things down further.",
    placeholder: "Enter your state",
    required: true,
  },
  {
    key: "bio",
    kind: "textarea",
    field: "bio",
    title: "Tell Us About Yourself",
    subtitle: "Optional — you can skip this.",
    placeholder: "A short line about yourself",
    required: false,
  },
  {
    key: "avatar",
    kind: "avatar",
    title: "Add a Profile Photo",
    subtitle: "Optional — you can skip this.",
    required: false,
  },
];

const ProfileSetupWizard = ({ isEdit = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // edit mode skips the intro screen and starts directly on the first real field
  const [stepIndex, setStepIndex] = useState(isEdit ? 1 : 0);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(isEdit);

  const {
    register,
    trigger,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: "",
      username: "",
      phone: "",
      city: "",
      state: "",
      bio: "",
    },
  });

  // edit mode: load the existing profile and prefill the form
  useEffect(() => {
    if (!isEdit) return;

    const loadProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/auth/profile/");
        const p = res.data;

        reset({
          full_name: p.full_name || "",
          username: p.username || "",
          phone: p.phone || "",
          city: p.city || "",
          state: p.state || "",
          bio: p.bio || "",
        });

        if (p.avatar_url) {
          setAvatarPreview(p.avatar_url);
        }
      } catch (err) {
        setServerError("Couldn't load your current profile.");
      } finally {
        setLoadingInitial(false);
      }
    };

    loadProfile();
  }, [isEdit, reset]);

  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const extractError = (err) => {
    const data = err.response?.data;
    if (!data) return "Something went wrong. Please try again.";
    if (data.message) return data.message;
    const firstKey = Object.keys(data)[0];
    return Array.isArray(data[firstKey]) ? data[firstKey][0] : "Something went wrong.";
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const finalSubmit = async (data) => {
    setSubmitting(true);
    setServerError("");

    try {
      const payload = {
        full_name: data.full_name,
        username: data.username,
        phone: data.phone,
        city: data.city,
        state: data.state,
        bio: data.bio || "",
      };

      if (isEdit) {
        await axiosInstance.patch("/api/auth/profile/", payload);
      } else {
        await axiosInstance.post("/api/auth/profile/", payload);
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append("image", avatarFile);
        await axiosInstance.post("/api/auth/profile/avatar/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // refresh redux user so profile_complete / nested profile data stays in sync
      await dispatch(loggedUser());

      if (isEdit) {
        navigate("/dashboard/profile");
      }
    } catch (err) {
      setServerError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = async () => {
    if (step.kind === "field" && step.required) {
      const valid = await trigger(step.field);
      if (!valid) return;
    }

    if (isLastStep) {
      handleSubmit(finalSubmit)();
      return;
    }

    setStepIndex((i) => i + 1);
  };

  if (loadingInitial) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
        <p className="text-sm text-text-secondary">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-sm font-semibold text-text-primary">ResolveNet</span>
          </div>

          {isEdit && (
            <button
              onClick={() => navigate("/dashboard/profile")}
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Cancel editing"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
          {step.kind === "intro" && (
            <div className="text-center">
              <h1 className="text-lg font-semibold text-accent leading-snug">
                Better Solutions for a
                <br />
                Greener Tomorrow
              </h1>
              <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                Join ResolveNet and be a part of a community that shares
                ideas, solves real problems and builds a sustainable future
                together.
              </p>
              <p className="text-xs text-text-muted mt-4">
                Share Solution &nbsp;•&nbsp; Collaborate &nbsp;•&nbsp; Create Impact
              </p>
            </div>
          )}

          {step.kind === "field" && (
            <div>
              <h1 className="text-lg font-semibold text-text-primary">{step.title}</h1>
              <p className="text-sm text-text-secondary mt-1 mb-5">{step.subtitle}</p>

              <label className="text-sm text-text-secondary mb-1 block">
                {step.title.replace("?", "")}
                {step.required && <span className="text-error">*</span>}
              </label>
              <input
                type="text"
                placeholder={step.placeholder}
                className="w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
                {...register(step.field, {
                  required: step.required ? "This field is required" : false,
                })}
              />
              {errors[step.field] && (
                <p className="text-xs text-error mt-1">{errors[step.field].message}</p>
              )}
            </div>
          )}

          {step.kind === "textarea" && (
            <div>
              <h1 className="text-lg font-semibold text-text-primary">{step.title}</h1>
              <p className="text-sm text-text-secondary mt-1 mb-5">{step.subtitle}</p>

              <textarea
                rows={4}
                placeholder={step.placeholder}
                className="w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent resize-none"
                {...register(step.field)}
              />
            </div>
          )}

          {step.kind === "avatar" && (
            <div className="text-center">
              <h1 className="text-lg font-semibold text-text-primary">{step.title}</h1>
              <p className="text-sm text-text-secondary mt-1 mb-6">{step.subtitle}</p>

              <label htmlFor="avatar-upload" className="relative inline-block cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden mx-auto">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-text-muted" strokeWidth={1.5} />
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-surface">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          )}

          {serverError && (
            <p className="text-sm text-error text-center mt-4">{serverError}</p>
          )}

          {/* Action button */}
          <button
            type="button"
            onClick={goNext}
            disabled={submitting}
            className="w-full mt-6 bg-primary hover:bg-primary-light text-white rounded-full py-3 flex items-center justify-center transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <span className="text-sm font-medium">Saving...</span>
            ) : isLastStep ? (
              <span className="text-sm font-medium">
                {isEdit ? "Save Changes" : "Finish"}
              </span>
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {steps.map((s, i) => (
              <span
                key={s.key}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex ? "w-5 bg-primary" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default ProfileSetupWizard;