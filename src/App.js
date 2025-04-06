import React from 'react';
import DuplicatePartsAnalyzer from './components/DuplicatePartsAnalyzer';
import PartVarianceMatrix from './components/PartVarianceMatrix'; // Import the new component
import PlannerVarianceMatrix from './components/PlannerVarianceMatrix';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Parts Inventory Analysis</h1>
        <p>Analyze duplicate parts and variance data across locations.</p> {/* New header information */}
      </header>
      <main>
        <DuplicatePartsAnalyzer />
        <PartVarianceMatrix /> {/* Add the new component */}
          <PlannerVarianceMatrix />
      </main>
    </div>
  );
}

export default App;
