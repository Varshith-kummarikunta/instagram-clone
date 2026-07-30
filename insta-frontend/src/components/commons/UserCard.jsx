export const UserCard = ({ username, profileImg, rightElem, caption }) => {
  return (
    <div className="flex justify-between">
      <div className="flex gap-2 items-center">
        <img className="h-11 w-11 object-cover rounded-full" src={profileImg} />
        <div className="flex flex-col">
          <div className="font-semibold">{username}</div>
          <div className="text-sm text-gray-500">{caption}</div>
        </div>
      </div>
      <div>{rightElem}</div>
    </div>
  );
};
