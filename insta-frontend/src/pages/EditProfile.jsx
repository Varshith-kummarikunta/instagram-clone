import { useContext, useEffect, useState } from "react";
import { AuthContext, BASE_URL } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const EditProfile = () => {
  const { user, setUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    profilePicture: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch(`${BASE_URL}/profile/${user.username}`);

      const data = await res.json();

      setForm({
        name: data.user.name || "",
        bio: data.user.bio || "",
        profilePicture: data.user.profilePicture || "",
      });

      setPreview(data.user.profilePicture || "");
    } catch (err) {
      console.log(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const imageUrl = await uploadImage();
    if (!imageUrl) return;

    try {
      const res = await fetch(`${BASE_URL}/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          profilePicture: imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Profile Updated Successfully");

      const updatedUser = {
        ...user,
        ...data,
      };

      setUser(updatedUser);

      localStorage.setItem("user_details", JSON.stringify(updatedUser));

      navigate(`/profile/${updatedUser.username}`);
    } catch (err) {
      console.log(err);
    }
  }

  async function uploadImage() {
    if (!file) return form.profilePicture;

    const fd = new FormData();

    fd.append("file", file);

    const res = await fetch(`${BASE_URL}/profile/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
      body: fd,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return null;
    }

    return data.imageUrl;
  }

  return (
    <div className="max-w-xl mx-auto text-white mt-10">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <img
            src={preview || "https://ui-avatars.com/api/?name=User"}
            className="w-32 h-32 rounded-full object-cover"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selected = e.target.files[0];

              if (!selected) return;

              setFile(selected);

              setPreview(URL.createObjectURL(selected));
            }}
          />
        </div>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          className="bg-[#222] p-3 rounded"
        />

        <textarea
          placeholder="Bio"
          value={form.bio}
          onChange={(e) =>
            setForm({
              ...form,
              bio: e.target.value,
            })
          }
          className="bg-[#222] p-3 rounded h-28"
        />

        <button className="bg-blue-500 p-3 rounded font-semibold">
          Save Changes
        </button>
      </form>
    </div>
  );
};
