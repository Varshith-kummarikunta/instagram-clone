import { useEffect } from "react";
import { IoClose } from "react-icons/io5";

export const StoryViewer = ({
  open,
  stories,
  currentIndex,
  setCurrentIndex,
  onClose,
}) => {
  if (!open || stories.length === 0) return null;

  const story = stories[currentIndex];

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      nextStory();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, open]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      {/* Left click area */}
      <div
        onClick={prevStory}
        className="absolute left-0 top-0 w-1/2 h-full cursor-pointer"
      />

      {/* Right click area */}
      <div
        onClick={nextStory}
        className="absolute right-0 top-0 w-1/2 h-full cursor-pointer"
      />

      {/* Progress bar */}
      <div className="absolute top-2 left-2 right-2 h-1 bg-gray-700 rounded">
        <div
          className="h-full bg-white rounded animate-[progress_5s_linear]"
          style={{ width: "100%" }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white z-20"
      >
        <IoClose size={35} />
      </button>

      {/* User info */}
      <div className="absolute top-5 left-5 flex items-center gap-3 text-white z-20">
        <img
          src={
            story.author?.profilePicture ||
            "https://ui-avatars.com/api/?name=user"
          }
          className="w-10 h-10 rounded-full object-cover"
        />

        <span className="font-semibold">{story.author?.username}</span>
      </div>

      {/* Story image */}
      <img
        src={story.imageUrl}
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain z-10"
      />
    </div>
  );
};
