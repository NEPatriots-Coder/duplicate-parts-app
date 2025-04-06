// src/components/SheetSelectorModal.js
import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Make sure to set the app element for accessibility

const SheetSelectorModal = ({ isOpen, onClose, onSelect }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Select Sheet"
      className="modal"
      overlayClassName="overlay"
    >
      <h2>Choose Which Sheet you would like to view!</h2>
      <button onClick={() => onSelect('Duplicate Parts')}>Duplicate Parts</button>
      <button onClick={() => onSelect('Part Variances')}>Part Variances</button>
      <button onClick={() => onSelect('Planner Variances')}>Planner Variances</button>
    </Modal>
  );
};

export default SheetSelectorModal;