import React from "react";

type AlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
  message: string;
};

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div className="alert-content" onClick={e => e.stopPropagation()}>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default AlertModal;
