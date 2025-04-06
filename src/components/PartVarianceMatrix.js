import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './PartVarianceMatrix.css';

const PartVarianceMatrix = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    partNumber: '',
    location: '',
  });
  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // State for sorting

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/PartVarianceMatrix.csv');
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

              const locationFields = results.meta.fields.filter((field) => field !== 'Part');
              setUniqueLocations(locationFields);
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
          item.Part.toLowerCase().includes(filters.partNumber.toLowerCase())
        );
      }

      if (filters.location) {
        filtered = filtered.filter((item) => {
          const locationValue = parseFloat(item[filters.location]);
          return !isNaN(locationValue) && locationValue !== 0;
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
      <h1 className="title">Part Variance Matrix Viewer</h1>

      <div className="filter-section">
        <h2 className="subtitle">Filters</h2>
        <div className="filter-grid">
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
          <div className="filter-item">
            <label className="filter-label">
              Location
              <select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="filter-input"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
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

export default PartVarianceMatrix;
