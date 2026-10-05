import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PostImageCarousel = ({ media, caption }) => {
  const [index, setIndex] = useState(0);
  if (!media?.length) return null;

  const goPrev = () => setIndex((i) => (i === 0 ? media.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === media.length - 1 ? 0 : i + 1));

  return (
    <div className="relative aspect-square bg-card">
      <img
        src={media[index]?.image_url}
        alt={media[index]?.alt_text || caption}
        className="w-full h-full object-cover"
      />

      {media.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface/80 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-text-primary" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-surface/80 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-text-primary" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {media.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PostImageCarousel;