import { AuthContext } from "../../contexts/AuthContext";
import { UserCard } from "../commons/UserCard";
import { useContext, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { MessageBar } from "./MessageBar";

const dummyUsers = [
  {
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    username: "martha_maggi",
    showFollowing: true,
  },
  {
    img: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    username: "maddy",
    showFollowing: true,
  },
  {
    img: "https://plus.unsplash.com/premium_photo-1681489930334-b0d26fdb9ed8?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    username: "suzain",
    showFollowing: true,
  },
  {
    img: "https://images.unsplash.com/photo-1722322426803-101270837197?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    username: "marauders_map",
    showFollowing: true,
  },
  {
    img: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    username: "magic_mike",
    showFollowing: true,
  },
  {
    img: "https://images.unsplash.com/photo-1558203728-00f45181dd84?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    username: "rugby",
    showFollowing: true,
  },
];

export const RightNav = () => {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="w-[300px] flex flex-col gap-8 mt-8 mr-4">
        <UserCard
          key={user.username}
          username={user.username}
          profileImg={user.profilePicture || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
          caption={user.name}
          rightElem={<span className="text-blue-500">Switch</span>}
        />
        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-sm font-semibold">
            <div>Suggested for you</div>
            <div>See All</div>
          </div>
          {dummyUsers.map((suggestedUser) => (
            <UserCard
              key={suggestedUser.username}
              username={suggestedUser.username}
              profileImg={suggestedUser.img}
              caption="Following by yashrajsingh"
              rightElem={
                <span className="text-blue-500 text-sm font-semibold">
                  Follow
                </span>
              }
            />
          ))}
        </div>
      </div>

      <div>
        <div
          onClick={() => {
            setOpen(true);
          }}
          className="flex items-center gap-4 cursor-pointer"
        >
          <FaPlus size={28} />
        </div>
        <div>
          <MessageBar open={open} setOpen={setOpen} />
        </div>
      </div>
    </div>
  );
};
