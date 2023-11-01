const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'usbase',
  password: 'test',
  port: 5434,
});

app.use(cors());
app.use(express.json());

app.post('/getPolygonData', async (req, res) => {
    const { polygon } = req.body;
    if (!polygon || !Array.isArray(polygon) || polygon.length < 3) {
      return res.status(400).send('Bad Request: polygon is required and must have at least 3 points');
    }
  
    const closedPolygon = [...polygon, polygon[0]]; // Ensure the polygon is closed
    const polygonText = `ST_GeomFromText('POLYGON((${closedPolygon.map(coord => coord.join(' ')).join(', ')}))', 4326)`;
  
    try {
      const result = await pool.query(`
        SELECT kn_gfk FROM merged_wue_lode
        WHERE ST_Contains(
          ${polygonText},
          geom
        )
      `);
  
      res.json(result.rows.map(row => row.kn_gfk));
    } catch (error) {
      console.error(error.message); // Log only the error message to avoid leaking sensitive information
      res.status(500).send('Server Error');
    }
  });
  

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
