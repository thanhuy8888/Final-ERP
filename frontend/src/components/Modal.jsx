import React from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, icon, actions }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {icon && <div className="modal-icon">{icon}</div>}
                {title && <h2 className="modal-title">{title}</h2>}
                <div className="modal-body">
                    {children}
                </div>
                <div className="modal-actions">
                    {actions ? actions : (
                        <button className="modal-btn primary" onClick={onClose}>
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
