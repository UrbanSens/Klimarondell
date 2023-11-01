const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'usbase',
  password: 'test',
  port: 5434,
});

const WURZBURG_COORDINATES = { lat: 49.7913, lon: 9.9534 };
const RADIUS = 5; // in kilometers

const fetchWeatherData = async () => {
  try {
    // Call the stationOverviewExtended API
    const response = await axios.get('https://app-prod-ws.warnwetter.de/v30', {
      params: {
        // Add necessary parameters here
        latitude: WURZBURG_COORDINATES.lat,
        longitude: WURZBURG_COORDINATES.lon,
        radius: RADIUS,
      }
    });

    const data = response.data;
    console.log(data);

    // Transform the API response to match the expected format for storing in the database
    // This is a placeholder transformation and should be adjusted based on the actual API response structure
    const weatherData = {
      stations: [
        // Extract station data from the API response
      ],
      forecasts: {
        // Extract forecast data from the API response
      }
    };

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

const storeWeatherDataInDatabase = async (weatherData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Store station data
    for (const station of weatherData.stations) {
      const query = 'INSERT INTO weather_stations(station_id, name, latitude, longitude) VALUES($1, $2, $3, $4) ON CONFLICT(station_id) DO NOTHING';
      const values = [station.id, station.name, station.latitude, station.longitude];
      await client.query(query, values);
    }

    // Store forecast data
    for (const forecast of weatherData.forecasts) {
      const query = 'INSERT INTO weather_forecasts(station_id, forecast_time, temperature, wind_speed, wind_direction, precipitation) VALUES($1, $2, $3, $4, $5, $6) ON CONFLICT(station_id, forecast_time) DO UPDATE SET temperature = EXCLUDED.temperature, wind_speed = EXCLUDED.wind_speed, wind_direction = EXCLUDED.wind_direction, precipitation = EXCLUDED.precipitation';
      const values = [forecast.station_id, forecast.forecast_time, forecast.temperature, forecast.wind_speed, forecast.wind_direction, forecast.precipitation];
      await client.query(query, values);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error storing weather data in database:', error);
  } finally {
    client.release();
  }
};

const fetchDataAndStore = async () => {
  try {
    const weatherData = await fetchWeatherData();
    await storeWeatherDataInDatabase(weatherData);
    console.log('Weather data fetched and stored successfully');
  } catch (error) {
    console.error('Error fetching and storing weather data:', error);
  }
};

fetchDataAndStore();
