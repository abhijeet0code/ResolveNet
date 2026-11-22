
import React, { useEffect, useRef, useState } from "react";
import SpotlightCard from "../animation/SpotlightCard";

import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../../config/axiosInstance";
import resolve from "../../assets/ResolveNet-favicon-white-detail.png";

import { loggedUser } from "../../features/auth/state/authAction";

import {
  Camera,
  User,
  X,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";


// Maximum image size: 5 MB
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

// Supported image formats
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


// Extract backend error messages
const extractError = (error) => {
  const data = error.response?.data;

  if (!data) {
    return error.message || "Something went wrong.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  const firstError = Object.values(data)[0];

  if (Array.isArray(firstError)) {
    return firstError[0];
  }

  return firstError || "Unable to update your profile.";
};


const UpdateProfile = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Profile form configuration
  const steps = [
    {
      key: "full_name",
      kind: "field",
      field: "full_name",
      title: "Your Name",
      subtitle: "Let's get started.",
      placeholder: "Enter your full name",
      required: true,
    },
    {
      key: "username",
      kind: "field",
      field: "username",
      title: "Username",
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
      key: "occupation",
      kind: "choice",
      field: "occupation",
      title: "Who are you?",
      subtitle: "Tell us more about yourself.",
      required: false,
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
      required: false,
    },
  ];


  // -----------------------------------------
  // 1. STATES
  // -----------------------------------------

  const [currentAvatarUrl, setCurrentAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Reference to the hidden image input
  const fileInputRef = useRef(null);


  // -----------------------------------------
  // 2. REACT HOOK FORM
  // -----------------------------------------

  const {
    register,
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
      occupation: "",
      bio: "",
    },
  });


  // -----------------------------------------
  // 3. FETCH EXISTING USER PROFILE
  // -----------------------------------------

  useEffect(() => {

    let isMounted = true;

    const loadProfile = async () => {

      try {

        const response = await axiosInstance.get(
          "/api/auth/profile/"
        );

        const profile = response.data;

        if (!isMounted) return;

        // Fill form with existing database information
        reset({
          full_name: profile.full_name || "",
          username: profile.username || "",
          phone: profile.phone || "",
          city: profile.city || "",
          state: profile.state || "",
          occupation: profile.occupation || "",
          bio: profile.bio || "",
        });

        // Load existing profile image
        setCurrentAvatarUrl(profile.avatar_url || "");

      } catch (error) {

        if (isMounted) {
          setServerError(
            "Couldn't load your profile. Please try again."
          );
        }

      } finally {

        if (isMounted) {
          setLoadingInitial(false);
        }

      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };

  }, [reset]);


  // -----------------------------------------
  // 4. CREATE AND CLEAN UP IMAGE PREVIEW
  // -----------------------------------------

  useEffect(() => {

    if (!avatarFile) {
      setLocalPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);

    setLocalPreviewUrl(objectUrl);

    // Clean up temporary browser URL
    return () => {
      URL.revokeObjectURL(objectUrl);
    };

  }, [avatarFile]);


  // -----------------------------------------
  // 5. HANDLE IMAGE SELECTION
  // -----------------------------------------

  const handleAvatarChange = (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setServerError("");
    setSuccessMessage("");

    // Validate image format
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {

      setServerError(
        "Please select a JPG, PNG or WEBP image only."
      );

      e.target.value = "";
      return;
    }

    // Validate image size
    if (file.size > MAX_AVATAR_SIZE) {

      setServerError(
        "Your image should be less than 5 MB."
      );

      e.target.value = "";
      return;
    }

    // Save selected image in React state
    setAvatarFile(file);

  };


  // Cancel selected image
  const cancelAvatarChange = () => {

    setAvatarFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setServerError("");

  };


  // -----------------------------------------
  // 6. SAVE PROFILE AND UPLOAD AVATAR
  // -----------------------------------------

  const onSubmit = async (data) => {

    setSubmitting(true);

    setServerError("");
    setSuccessMessage("");

    let profileUpdated = false;

    try {

      // Prepare profile information
      const profilePayload = {

        full_name: data.full_name.trim(),

        username: data.username.trim(),

        phone: data.phone.trim(),

        city: data.city.trim(),

        state: data.state.trim(),

        occupation: data.occupation,

        bio: data.bio.trim(),

      };


      // FIRST: Update normal profile information
      await axiosInstance.patch(
        "/api/auth/profile/",
        profilePayload
      );

      profileUpdated = true;


      // SECOND: Upload profile image if selected
      if (avatarFile) {

        const formData = new FormData();

        formData.append("image", avatarFile);

        await axiosInstance.post(
          "/api/auth/profile/avatar/",
          formData
        );

      }


      // THIRD: Refresh Redux authentication information
      await dispatch(loggedUser());


      // FOURTH: Fetch the persistent image URL
      const updatedProfile = await axiosInstance.get(
        "/api/auth/profile/"
      );

      setCurrentAvatarUrl(
        updatedProfile.data.avatar_url || ""
      );


      // Clear selected temporary image
      setAvatarFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }


      setSuccessMessage(
        "Your profile has been updated successfully."
      );

    } catch (error) {

      if (profileUpdated) {

        setServerError(
          "Your profile details were saved, but the photo upload or profile refresh failed. Please check your profile and try again."
        );

      } else {

        setServerError(extractError(error));

      }

    } finally {

      setSubmitting(false);

    }

  };


  // Image shown in the profile preview
  const displayedAvatar =
    localPreviewUrl || currentAvatarUrl;


  // -----------------------------------------
  // 7. INITIAL LOADING
  // -----------------------------------------

  if (loadingInitial) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-screen px-4">

        <div className="flex items-center gap-3 text-text-secondary">

          <LoaderCircle className="w-5 h-5 animate-spin" />

          <p className="text-sm">
            Loading your profile...
          </p>

        </div>

      </div>

    );

  }


  // -----------------------------------------
  // 8. EDIT PROFILE UI
  // -----------------------------------------

  return (

    <div className="w-full min-h-screen grid items-center justify-center px-4 py-12">

      <SpotlightCard
        theme="gray"
        intensity={0.80}
        spotlightSize={250}
        softness={0.7}
        shape="circle"
        borderGlow={0.2}
        proximity={50}
        smoothing={0.1}
        grain={0}
        ambient={false}
        flare
        className="w-full max-w-4xl !h-auto !min-h-0"
      >

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 p-5 md:p-8"
        >

          {/* Heading */}

          <div className="flex items-center justify-between">

            <h1 className="text-2xl text-primary font-semibold">
              Edit Profile
            </h1>

            <button
              type="button"
              onClick={() => navigate("/dashboard/profile")}
              className="p-2 rounded-full hover:bg-surface transition-colors"
              aria-label="Close edit profile"
            >

              <X className="w-5 h-5" />

            </button>

          </div>


          {/* ResolveNet Profile Header */}

          
            

          


          {/* Hidden Image Input */}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />

          <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-green-950 rounded-xl p-3 text-sm text-white transition-transform duration-300 hover:scale-105"
            >

              <Camera className="w-4 h-4" />

              Edit Profile Picture

            </button>
          {/* Selected Profile Image Preview */}

          <div className="flex items-center gap-4">

            <div className="w-24 h-24 rounded-full overflow-hidden bg-surface border">

              {displayedAvatar ? (

                <img
                  src={displayedAvatar}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />

              ) : (

                <div className="w-full h-full flex items-center justify-center">

                  <User className="w-10 h-10 text-gray-400" />

                </div>

              )}

            </div>


            <div className="flex flex-col gap-2">

              <p className="text-sm font-medium">
                Profile Photo
              </p>

              <p className="text-xs text-gray-500">
                JPG, PNG or WEBP. Maximum 5 MB.
              </p>

              {avatarFile && (

                <button
                  type="button"
                  onClick={cancelAvatarChange}
                  className="text-sm text-red-600 text-left"
                >
                  Remove selected image
                </button>

              )}

            </div>

          </div>


          {/* Dynamic Profile Fields */}

          <div className="w-full flex flex-col gap-5">

            {steps.map((step) => (

              <div
                key={step.key}
                className="w-full flex flex-col gap-2"
              >

                {/* Normal Input Fields */}

                {step.kind === "field" && (

                  <>

                    <label className="text-sm text-text-secondary">

                      {step.title}

                      {step.required && (
                        <span className="text-red-500"> *</span>
                      )}

                    </label>

                    <input
                      type={step.field === "phone" ? "tel" : "text"}
                      placeholder={step.placeholder}
                      {...register(step.field, {
                        required: step.required
                          ? `${step.title} is required.`
                          : false,
                        ...(step.field === "phone" && {
                          pattern: {
                            value: /^[0-9+\-\s()]{7,20}$/,
                            message: "Enter a valid phone number.",
                          },
                        }),
                      })}
                      className="block w-full h-14 px-4 bg-white border border-transparent rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 focus:bg-screen focus:border-green-900 focus:ring-4 focus:ring-green-900/5"
                    />

                    {errors[step.field] && (

                      <p className="text-xs text-red-500">
                        {errors[step.field].message}
                      </p>

                    )}

                  </>

                )}


                {/* Occupation Selection */}

                {step.kind === "choice" && (

                  <>

                    <label className="text-sm text-text-secondary">
                      {step.title}
                    </label>

                    <select
                      {...register(step.field)}
                      className="block w-full h-14 px-4 bg-white border border-transparent rounded-xl text-sm text-gray-900 outline-none focus:border-green-900 focus:ring-4 focus:ring-green-900/5"
                    >

                      <option value="">
                        Select your occupation
                      </option>

                      <option value="student">
                        Student
                      </option>

                      <option value="working_professional">
                        Working Professional
                      </option>

                      <option value="researcher">
                        Researcher
                      </option>

                      <option value="government_official">
                        Government Official
                      </option>

                      <option value="industry">
                        Industry
                      </option>

                      <option value="university">
                        University Representative
                      </option>

                      <option value="other">
                        Other
                      </option>

                    </select>

                  </>

                )}


                {/* Bio Textarea */}

                {step.kind === "textarea" && (

                  <>

                    <label className="text-sm text-text-secondary">
                      {step.title}
                    </label>

                    <textarea
                      rows={5}
                      placeholder={step.placeholder}
                      {...register(step.field, {
                        maxLength: {
                          value: 300,
                          message: "Bio cannot exceed 300 characters.",
                        },
                      })}
                      className="block w-full min-h-36 px-4 py-3 bg-white border border-transparent rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none resize-none transition-all duration-200 focus:bg-screen focus:border-green-900 focus:ring-4 focus:ring-green-900/5"
                    />

                    {errors[step.field] && (

                      <p className="text-xs text-red-500">
                        {errors[step.field].message}
                      </p>

                    )}

                  </>

                )}

              </div>

            ))}

          </div>


          {/* Server Error */}

          {serverError && (

            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-700">

              <AlertCircle className="w-5 h-5 shrink-0" />

              <p className="text-sm">
                {serverError}
              </p>

            </div>

          )}


          {/* Success Message */}

          {successMessage && (

            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 text-green-800">

              <CheckCircle2 className="w-5 h-5" />

              <p className="text-sm">
                {successMessage}
              </p>

            </div>

          )}


          {/* Submit Button */}

          <div className="flex justify-end pt-3">

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-green-950 text-white rounded-xl px-8 py-3 text-sm font-medium transition-all hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {submitting ? (

                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  Saving...
                </>

              ) : (

                "Save Changes"

              )}

            </button>

          </div>

        </form>

      </SpotlightCard>

    </div>

  );

};

export default UpdateProfile;
