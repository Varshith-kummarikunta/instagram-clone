import { GoHomeFill } from "react-icons/go";
import { IoSearch } from "react-icons/io5";
import { MdOutlineExplore } from "react-icons/md";
import { BsPlayBtn } from "react-icons/bs";
import { MdOutlineMessage } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { CgDetailsMore } from "react-icons/cg";
import { FaBoxesStacked } from "react-icons/fa6";
import { useState, useContext } from "react";
import { CreatePostModal } from "./CreatePostModal";
import { AuthContext } from "../../contexts/AuthContext";
import { MdLogout } from "react-icons/md";
import { Link } from "react-router-dom";
import { Notifications } from "../notifications/Notifications";

export const LeftNav = ({ onPostCreated }) => {
  const { logout, user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 w-64 overflow-visible flex flex-col justify-between border-r border-gray-700 pl-6 h-screen pb-4">
      <div className="mt-8 flex flex-col gap-10">
        <div className="text-3xl" style={{ fontFamily: "cursive" }}>
          Instagram
        </div>
        <div className="flex flex-col gap-6 text-lg font-semibold">
          <div className="flex items-center gap-4">
            <GoHomeFill size={28} />
            <div>Home</div>
          </div>
          <Link to="/search" className="flex items-center gap-4">
            <IoSearch size={28} />
            <div>Search</div>
          </Link>
          <div className="flex items-center gap-4">
            <MdOutlineExplore size={28} />
            <div>Explore</div>
          </div>
          <div className="flex items-center gap-4">
            <BsPlayBtn size={28} />
            <div>Reels</div>
          </div>
          <Link to="/messages" className="flex items-center gap-4">
            <MdOutlineMessage size={28} />
            <div>Messages</div>
          </Link>
          <Notifications />
          <div
            onClick={() => {
              setOpen(true);
            }}
            className="flex items-center gap-4 cursor-pointer"
          >
            <FaPlus size={28} />
            <div>Create</div>
          </div>
          <Link
            to={`/profile/${user.username}`}
            className="flex items-center gap-4"
          >
            <CgProfile size={28} />
            <div>Profile</div>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-6 text-lg font-semibold">
        <div className="flex items-center gap-4">
          <CgDetailsMore size={28} />
          <div>More</div>
        </div>
        <div className="flex items-center gap-4">
          <FaBoxesStacked size={28} />
          <div>Also from Meta</div>
        </div>
        <div
          onClick={logout}
          className="flex items-center gap-4 cursor-pointer"
        >
          <MdLogout size={28} />
          <div>Logout</div>
        </div>
      </div>
      <CreatePostModal
        open={open}
        setOpen={setOpen}
        onPostCreated={onPostCreated}
      />
    </div>
  );
};
