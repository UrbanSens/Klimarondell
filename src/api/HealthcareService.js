// HealthcareService.js

/**
 * Fetch healthcare distribution data based on the given polygon coordinates.
 * @param {string} polygonCoords - The coordinates of the drawn polygon.
 * @returns {Promise<object[]>} The parsed healthcare distribution data.
 */
export const fetchHealthcareDistribution = (polygonCoords) => {
    const apiUrl = `http://localhost:3001/api/healthcare-distribution?polygonCoords=${encodeURIComponent(polygonCoords)}`;
  
    return fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        }
        // Parse the count as an integer and keep the rest of the object intact
        return data.map(item => ({
          ...item,
          count: parseInt(item.count, 10)
        }));
      });
  };
  