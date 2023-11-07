const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'usbase',
  password: process.env.DB_PASSWORD || 'test',
  port: process.env.DB_PORT || 5434,
});

app.get('/api/healthcare-distribution', async (req, res) => {
  try {
    const { polygonCoords } = req.query;
    console.log("Received polygonCoords:", polygonCoords); // Log the polygonCoords to debug
    if (!polygonCoords) {
      return res.status(400).json({ error: 'polygonCoords is required' });
    }

    // Transform the coordinates from EPSG:3857 to EPSG:4326 before using them in the query
    const query = `
      SELECT healthcare, COUNT(*) AS count
      FROM health_wue
      WHERE ST_Contains(
        ST_Transform(ST_GeomFromText('POLYGON((${polygonCoords}))', 3857), 4326),
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
      )
      GROUP BY healthcare;
    `;

    console.log("Executing query:", query); // Log the query to debug

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (queryError) {
    console.error('Error executing query:', queryError.stack);
    res.status(500).json({ 
      error: 'Error executing query',
      message: queryError.message,
      query: queryError.query
    });
  }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
