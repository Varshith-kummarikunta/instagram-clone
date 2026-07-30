import { useState, useEffect } from "react";
import Modal from "react-modal";
import { UserCard } from "../commons/UserCard";
import { useContext } from "react";
import { AuthContext, BASE_URL } from "../../contexts/AuthContext";

const customStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    minWidth: "600px",
    height: "520px",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    background: "#111",
    color: "#fff",
    padding: 0,
    overflow: "hidden",
  },
};

export const CreatePostModal = ({ open, setOpen, onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(e) {
    const uploadedFile = e.target.files[0];

    if (!uploadedFile) return;

    setFile(uploadedFile);

    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
  }

  function handleClose() {
    setOpen(false);
    setFile(null);
    setPreviewUrl(null);
    setCaption("");
  }

  async function handleUpload() {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BASE_URL}/posts/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        return null;
      }

      return data.imageUrl;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async function onShare() {
    const url = await handleUpload();

    if (!url) return;

    try {
      const res = await fetch(`${BASE_URL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: url,
          caption,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        return;
      }

      handleClose();

      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Modal isOpen={open} onRequestClose={handleClose} style={customStyles}>
      <div className="header p-2 text-center bg-black">
        <div>Create new post</div>
        <button
          onClick={onShare}
          className="text-blue-500 font-semibold absolute top-2 right-2"
        >
          Share
        </button>
      </div>
      {!file ? (
        <div className="body flex flex-col gap-2 items-center justify-center h-full">
          <div className="text-lg">Drag photos and videos here</div>
          <label className="p-2 bg-blue-500 rounded cursor-pointer">
            Select images from computer
            <input
              onChange={handleFileChange}
              className="hidden"
              type="file"
              accept="image/*"
            />
          </label>
        </div>
      ) : (
        <div className="flex">
          <img src={previewUrl} className="w-[500px] h-[520px] object-cover" />
          <div className="w-[350px] p-2 flex flex-col gap-2">
            <UserCard
              username={user.username}
              profileImg="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption"
              className="bg-[#111] h-[250px]"
            ></textarea>
          </div>
        </div>
      )}
    </Modal>
  );
};
