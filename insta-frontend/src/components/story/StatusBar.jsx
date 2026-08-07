import { useContext, useEffect, useState } from "react";
import { AuthContext, BASE_URL } from "../../contexts/AuthContext";
import { FaPlus } from "react-icons/fa";
import { CreateStoryModal } from "./CreateStoryModal";
import { StoryViewer } from "./StoryViewer";

export const StatusBar = () => {
  const { user } = useContext(AuthContext);

  const [stories, setStories] = useState([]);
  const [open, setOpen] = useState(false);

  const [viewerOpen, setViewerOpen] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    try {
      const res = await fetch(`${BASE_URL}/stories`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setStories(data);
      }
    } catch (err) {
      console.log(err);
    }
  }

  function onStoryCreated(story) {
    setStories((prev) => [story, ...prev]);
  }
  return (
    <>
      <div
        className="flex gap-2 w-[600px] overflow-x-auto no-scrollbar p-2"
        style={{ scrollbarWidth: "none" }}
      >
        <div
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <div className="w-[90px] h-[90px] rounded-full border-2 border-gray-500 flex items-center justify-center">
            <FaPlus size={28} />
          </div>

          <div className="text-sm">Your Story</div>
        </div>

        {stories.map((story, index) => (
          <div
            key={story._id}
            className="flex flex-col gap-2 flex-shrink-0 items-center"
            onClick={() => {
              setCurrentIndex(index);
              setViewerOpen(true);
            }}
          >
            <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
              <div className="w-[84px] h-[84px] rounded-full bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={story.author.profilePicture}
                  className="w-[78px] h-[78px] rounded-full object-cover"
                  alt={story.author.username}
                />
              </div>
            </div>

            <div className="text-sm">{story.author.username}</div>
          </div>
        ))}
      </div>

      <CreateStoryModal
        open={open}
        setOpen={setOpen}
        onStoryCreated={onStoryCreated}
      />
      <StoryViewer
        open={viewerOpen}
        stories={stories}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
};
