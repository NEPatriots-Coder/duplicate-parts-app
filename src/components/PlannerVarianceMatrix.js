import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './PlannerVarianceMatrix.css';

const PlannerVarianceMatrix = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    planner: '',
    variance: '',
    partNumber: '',
  });
  const [uniqueVariances, setUniqueVariances] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/NewSummary.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const csvFile = await response.text();

        Papa.parse(csvFile, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data && results.data.length > 0) {
              setData(results.data);
              setFilteredData(results.data);

              const varianceFields = results.meta.fields.filter((field) => field !== 'Planner' && field !== 'Part number');
              setUniqueVariances(varianceFields);
            } else {
              setError('No data found in the CSV file');
            }
            setLoading(false);
          },
          error: (error) => {
            setError(`Error parsing CSV: ${error.message}`);
            setLoading(false);
          },
        });
      } catch (error) {
        setError(`Error loading file: ${error.message}`);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...data];

      if (filters.partNumber) {
        filtered = filtered.filter((item) =>
          typeof item['Part number'] === 'string' && item['Part number'].toLowerCase().includes(filters.partNumber.toLowerCase())
        );
      }

      if (filters.planner) {
        filtered = filtered.filter((item) =>
          typeof item.Planner === 'string' && item.Planner.toLowerCase().includes(filters.planner.toLowerCase())
        );
      }

      if (filters.variance) {
        filtered = filtered.filter((item) => {
          const varianceValue = parseFloat(item[filters.variance]);
          return !isNaN(varianceValue) && varianceValue !== 0;
        });
      }

      setFilteredData(filtered);
    };

    applyFilters();
  }, [filters, data]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });

    const sortedData = [...filteredData].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredData(sortedData);
  };

  if (loading) return <div className="loading">Loading data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <h1 className="title">Planner Variance Matrix Viewer</h1>

      <div className="filter-section">
        <h2 className="subtitle">Filters</h2>
        <div className="filter-grid">
          <div className="filter-item">
            <label className="filter-label">
              Planner
              <input
                type="text"
                name="planner"
                value={filters.planner}
                onChange={handleFilterChange}
                className="filter-input"
                placeholder="Filter by planner"
              />
            </label>
          </div>
          <div className="filter-item">
            <label className="filter-label">
              Variance
              <select
                name="variance"
                value={filters.variance}
                onChange={handleFilterChange}
                className="filter-input"
              >
                <option value="">All Variances</option>
                {uniqueVariances.map((variance) => (
                  <option key={variance} value={variance}>
                    {variance}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="filter-item">
            <label className="filter-label">
              Part Number
              <input
                type="text"
                name="partNumber"
                value={filters.partNumber}
                onChange={handleFilterChange}
                className="filter-input"
                placeholder="Filter by part number"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <h2 className="subtitle">Summary</h2>
        <p>Total parts: {data.length}</p>
        <p>Filtered results: {filteredData.length}</p>
      </div>

      {filteredData.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    className="px-4 py-2 border"
                    onClick={() => handleSort(key)}
                  >
                    {key} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx}>
                  {Object.keys(row).map((key) => (
                    <td key={key} className="px-4 py-2 border text-right">
                      {row[key] !== undefined ? row[key] : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-results">No data found matching your filters.</div>
      )}
    </div>
  );
};

export default PlannerVarianceMatrix;