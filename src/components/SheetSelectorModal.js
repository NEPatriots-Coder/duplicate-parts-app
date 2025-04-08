// src/components/SheetSelectorModal.js
import React from 'react';
import Modal from 'react-modal';
import './SheetSelectorModal.css'; // Import the CSS file

Modal.setAppElement('#root'); // Correct placement and import

const SheetSelectorModal = ({ isOpen, onClose, onSelect }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Select Sheet"
      className="modal"
      overlayClassName="overlay"
    >
      <h2>Choose which sheet of data you would like to view </h2>
      <img src="dashboard_image.jpg" alt="Description of image" className="modal-image" />
      <div className="button-container">
        <button onClick={() => onSelect('Duplicate Parts')}>Duplicate Parts</button>
        <button onClick={() => onSelect('Part Variances')}>Part Variances</button>
        <button onClick={() => onSelect('Planner Variances')}>Planner Counts</button>
      </div>
    </Modal>
  );
};

export default SheetSelectorModal;