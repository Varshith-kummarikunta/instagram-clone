const stories = [
  {
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "Maggie",
    id: 1,
  },
  {
    img: "https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "Steve",
    id: 2,
  },
  {
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "Stephenie",
    id: 3,
  },
  {
    img: "https://images.unsplash.com/photo-1698510047345-ff32de8a3b74?q=80&w=1392&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "John",
    id: 4,
  },
  {
    img: "https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "Richard",
    id: 5,
  },
  {
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "Hannah",
    id: 6,
  },
  {
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "Maggie",
    id: 7,
  },
  {
    img: "https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "Steve",
    id: 8,
  },
  {
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "Stephenie",
    id: 9,
  },
  {
    img: "https://images.unsplash.com/photo-1698510047345-ff32de8a3b74?q=80&w=1392&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "John",
    id: 10,
  },
  {
    img: "https://plus.unsplash.com/premium_photo-1689539137236-b68e436248de?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "Richard",
    id: 11,
  },
  {
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "Hannah",
    id: 12,
  },
];
export const StatusBar = () => {
  return (
    <div
      className="flex gap-2 w-[600px] overflow-x-auto no-scrollbar p-2"
      style={{ scrollbarWidth: "none" }}
    >
      {stories.map((story) => (
        <div
          key={story.id}
          className="flex flex-col gap-2 flex-shrink-0 items-center"
        >
          <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
            <div className="w-[84px] h-[84px] rounded-full bg-black flex items-center justify-center overflow-hidden">
              <img
                className="w-[78px] h-[78px] rounded-full object-cover"
                src={story.img}
              />
            </div>
          </div>

          <div className="text-sm">{story.name}</div>
        </div>
      ))}
    </div>
  );
};
