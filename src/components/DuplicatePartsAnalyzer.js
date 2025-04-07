import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import _ from 'lodash';
import './DuplicatePartsAnalyzer.css';

const DuplicatePartsAnalyzer = () => {
  const [data, setData] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    partNumber: '',
    location: '',
  });
  const [uniqueLocations, setUniqueLocations] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.PUBLIC_URL}/NewSummary.csv`);
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

              const locationField = 'Branch';
              const locations = [...new Set(results.data.map(item => item[locationField]))].filter(Boolean);
              setUniqueLocations(locations);

              findDuplicates(results.data, results.meta.fields);
            } else {
              setError('No data found in the CSV file');
            }
            setLoading(false);
          },
          error: (error) => {
            setError(`Error parsing CSV: ${error}`);
            setLoading(false);
          }
        });
      } catch (error) {
        setError(`Error loading file: ${error.message}`);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const findDuplicates = (data, fields) => {
    const partNumberField = 'Part';
    const locationField = 'Branch';
    const groupedByPart = _.groupBy(data, partNumberField);

    const startCountField = 'StartCount';
    const endCountField = 'EndCount';
    const differenceField = 'Difference';
    const varianceField = 'Variance'; // represents percent change

    const safeParse = (val, label = '') => {
      const num = parseFloat(val);
      if (isNaN(num)) console.warn(`Non-numeric ${label}:`, val);
      return isNaN(num) ? 0 : num;
    };

    const duplicateParts = Object.entries(groupedByPart)
      .filter(([_, items]) => items.length > 1)
      .map(([partNumber, items]) => {
        const counts = items.map(item => {
          const start = safeParse(item[startCountField], 'StartCount');
          const end = safeParse(item[endCountField], 'EndCount');
          const diff = safeParse(item[differenceField], 'Difference');
          const pctChange = safeParse(item[varianceField], 'Variance');

          return {
            location: item[locationField] || '',
            description: item['Description'] || '',
            startCount: start,
            endCount: end,
            difference: diff,
            percentChange: pctChange
          };
        });

        const diffValues = counts.map(c => c.difference).filter(n => !isNaN(n));
        const mean = diffValues.reduce((sum, val) => sum + val, 0) / diffValues.length;
        const variance = diffValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / diffValues.length;
        const stdDev = Math.sqrt(variance);
        const range = Math.max(...diffValues) - Math.min(...diffValues);

        return {
          partNumber,
          items,
          counts,
          meanDifference: mean,
          stdDeviation: stdDev,
          range,
          min: Math.min(...diffValues),
          max: Math.max(...diffValues)
        };
      });

    setDuplicates(duplicateParts);
  };

  const filteredDuplicates = duplicates.filter(duplicate => {
    const partMatch = !filters.partNumber ||
      duplicate.partNumber.toLowerCase().includes(filters.partNumber.toLowerCase());

    const locationMatch = !filters.location ||
      duplicate.items.some(item =>
        item.Branch && item.Branch.toLowerCase().includes(filters.location.toLowerCase())
      );

    return partMatch && locationMatch;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="loading">Loading data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="container">
      <div className="image-container">
        <img src="/dashboard_image.jpg" alt="Logo" className="upper-right-image" />
      </div>
      <h1 className="title">Duplicate Parts at All Branches</h1>

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
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <h2 className="subtitle">Summary</h2>
        <p>Total duplicate parts found: {duplicates.length}</p>
        <p>Filtered results: {filteredDuplicates.length}</p>
      </div>

      {filteredDuplicates.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Part Number</th>
                <th className="px-4 py-2 border">Locations</th>
                <th className="px-4 py-2 border">Count Matrix</th>
                <th className="px-4 py-2 border">Range</th>
              </tr>
            </thead>
            <tbody>
              {filteredDuplicates.map((duplicate) => (
                <tr key={duplicate.partNumber}>
                  <td>{duplicate.partNumber}</td>
                  <td>{duplicate.items.map(item => item.Branch).join(', ')}</td>
                  <td>
                    <table className="matrix-table">
                      <thead>
                        <tr>
                          <th>Branch</th>
                          <th>Description</th>
                          <th>Start</th>
                          <th>End</th>
                          <th>Difference</th>
                          <th>Variance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {duplicate.counts.map((count, idx) => {
                          const avgCount = duplicate.meanDifference;
                          const countVariance = count.difference - avgCount;
                          const countVariancePercent = avgCount !== 0
                            ? ((countVariance / Math.abs(avgCount)) * 100).toFixed(2)
                            : "0.00";

                          const varianceStyle = {
                            color: countVariance > 0 ? 'green' : countVariance < 0 ? 'red' : 'black'
                          };

                          return (
                            <tr key={idx}>
                              <td>{count.location}</td>
                              <td>{count.description}</td>
                              <td className="text-right">{count.startCount}</td>
                              <td className="text-right">{count.endCount}</td>
                              <td className="text-right">{count.difference}</td>
                              <td className="text-right" style={varianceStyle}>
                                {countVariancePercent}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </td>
                  <td className="text-right">{duplicate.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-results">
          No duplicate parts found matching your filters.
        </div>
      )}
    </div>
  );
};

export default DuplicatePartsAnalyzer;
