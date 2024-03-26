import React from "react";
import CreateArea from "./CreateArea";

function Modal(props) {
  const modalStyle = {
    display: props.visible ? "block" : "none"
  };

  const handleClose = () => {
    props.onClose();
    props.onReset();
  };

  const handleModalClose = () => {
    props.onModalClose(); 
  };


  return (
    <div className="modal" style={modalStyle}>
      <div className="modal-content">
        <span className="close" onClick={handleClose}>
          &times;
        </span>
        <CreateArea modalOpen={props.visible}
          {...props} 
          onModalClose={handleModalClose} 
        />
      </div>
    </div>
  );
}

export default Modal;
