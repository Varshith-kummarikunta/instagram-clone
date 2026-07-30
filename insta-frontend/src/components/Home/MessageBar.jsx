import React from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

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
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
};


export const MessageBar = ({ open, setOpen }) => {
  return (
    <Modal
      isOpen={open}
      onRequestClose={() => setOpen(false)}
      style={customStyles}
    >
      <div className="header p-2 text-left bg-black">
        <div>Messages</div>
      </div>

      <div className="body flex place-items-start p-4">message1</div>
    </Modal>
  );
};
