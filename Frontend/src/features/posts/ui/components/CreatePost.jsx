import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X, MapPin } from "lucide-react";
import axiosInstance from "../../../../config/axiosInstance.jsx"; 

const CreatePost = () => {
  const navigate = useNavigate();

  const [images, setImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // object URLs
  const [caption, setCaption] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // silently capture GPS coordinates in the background, if the user allows it
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        // permission denied or unavailable — city/state alone is fine
      }
    );
  }, []);

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const extractError = (err) => {
    const data = err.response?.data;
    if (!data) return "Something went wrong. Please try again.";
    const firstKey = Object.keys(data)[0];
    return Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      setError("Please add at least one photo.");
      return;
    }
    if (!caption.trim()) {
      setError("Please write a caption.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      images.forEach((file) => formData.append("images", file));
      formData.append("caption", caption.trim());
      formData.append("city", city);
      formData.append("state", state);
      if (coords.latitude != null) {
        formData.append("latitude", coords.latitude);
        formData.append("longitude", coords.longitude);
      }

      await axiosInstance.post("/api/posts/create/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/dashboard");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold text-text-primary mb-4">
        Report an Issue
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Image picker */}
        <div className="grid grid-cols-3 gap-2">
          {previews.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-md overflow-hidden border border-border"
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-surface/90 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-text-primary" />
              </button>
            </div>
          ))}

          <label className="aspect-square rounded-md border border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer text-text-muted hover:text-text-secondary hover:border-accent transition-colors">
            <ImagePlus className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs">Add photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImagesChange}
            />
          </label>
        </div>

        {/* Caption */}
        <textarea
          rows={4}
          placeholder="Describe the issue..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full bg-card border border-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent resize-none"
        />

        {/* Location */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-text-secondary mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> City
            </label>
            <input
              type="text"
              placeholder="e.g. Ranchi"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1 block">State</label>
            <input
              type="text"
              placeholder="e.g. Jharkhand"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
            />
          </div>
        </div>

        {error && <p className="text-sm text-error text-center">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-md py-2.5 transition-colors disabled:opacity-60"
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;