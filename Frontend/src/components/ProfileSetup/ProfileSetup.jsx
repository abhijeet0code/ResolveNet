import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Camera, User } from "lucide-react";
import axiosInstance from "../../config/axiosInstance"

const ProfileSetup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");

    try {
      const formData = new FormData();
      formData.append("full_name", data.fullName);
      formData.append("phone", data.phone);
      formData.append("city", data.city);
      formData.append("bio", data.bio || "");
      if (imageFile) {
        formData.append("profile_picture", imageFile);
      }

      const res = await axiosInstance.post("/users/profile/setup/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // push the saved profile into redux so the rest of the app has it
      dispatch({ type: "auth/setProfile", payload: res.data });

      navigate("/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-text-primary mb-1">
          Set up your profile
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Tell us a bit about yourself to get started on ResolveNet
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Profile picture */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <label htmlFor="profile-picture" className="relative cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
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
              id="profile-picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="text-sm text-text-secondary mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your full name"
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
              {...register("fullName", { required: "Full name is required" })}
            />
            {errors.fullName && (
              <p className="text-xs text-error mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm text-text-secondary mb-1 block">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit number",
                },
              })}
            />
            {errors.phone && (
              <p className="text-xs text-error mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="text-sm text-text-secondary mb-1 block">
              City / District
            </label>
            <input
              type="text"
              placeholder="e.g. Ranchi"
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
              {...register("city", { required: "City is required" })}
            />
            {errors.city && (
              <p className="text-xs text-error mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm text-text-secondary mb-1 block">
              Bio <span className="text-text-muted">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="A short line about yourself"
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent resize-none"
              {...register("bio")}
            />
          </div>

          {serverError && (
            <p className="text-sm text-error text-center">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-md py-2.5 transition-colors disabled:opacity-60"
          >
            {loading ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;