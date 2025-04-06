import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import SheetSelectorModal from './components/SheetSelectorModal';
import DuplicatePartsAnalyzer from './components/DuplicatePartsAnalyzer';
import PartVarianceMatrix from './components/PartVarianceMatrix';
import PlannerVarianceMatrix from './components/PlannerVarianceMatrix';
import './App.css';

const App = () => {
  const navigate = useNavigate();
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [showBackButton, setShowBackButton] = useState(false);

  const handleSheetSelect = (sheet) => {
    setSelectedSheet(sheet);
    setIsModalOpen(false);
    setShowBackButton(true);
  };

  const handleBackButtonClick = () => {
    setSelectedSheet(null);
    setIsModalOpen(true);
    setShowBackButton(false);
    navigate('/');
  };

  return (
    <div className="App">
      {showBackButton && (
        <button onClick={handleBackButtonClick} className="back-button">Back</button>
      )}
      <SheetSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSheetSelect}
      />
      <Routes>
        <Route path="/" element={
          <>
            {selectedSheet === 'Duplicate Parts' && <DuplicatePartsAnalyzer />}
            {selectedSheet === 'Part Variances' && <PartVarianceMatrix />}
            {selectedSheet === 'Planner Variances' && <PlannerVarianceMatrix />}
          </>
        } />
      </Routes>
    </div>
  );
};

export default App;
