import { useState, useContext } from "react";
import { AuthContext, BASE_URL } from "../../contexts/AuthContext";

export const CreateStoryModal = ({
  open,
  setOpen,
  onStoryCreated,
}) => {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  if (!open) return null;

  async function uploadImage(file) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    setLoading(true);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      setImageUrl(data.secure_url);
      console.log("Image URL:", data.secure_url);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }

  async function createStory() {
    console.log(imageUrl);
    if (!imageUrl) {
      alert("Upload an image first");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      onStoryCreated(data);

      setImageUrl("");

      setOpen(false);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#222] rounded-xl p-6 w-[420px] flex flex-col gap-4">

        <h2 className="text-xl font-bold">
          Create Story
        </h2>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => uploadImage(e.target.files[0])}
        />

        {loading && (
          <p>Uploading...</p>
        )}

        {imageUrl && (
          <img
            src={imageUrl}
            className="rounded-lg max-h-[400px] object-cover"
          />
        )}

        <button
          onClick={createStory}
          className="bg-blue-500 py-2 rounded-lg"
        >
          Share Story
        </button>

        <button
          onClick={() => setOpen(false)}
          className="bg-red-500 py-2 rounded-lg"
        >
          Cancel
        </button>

      </div>
    </div>
  );
};