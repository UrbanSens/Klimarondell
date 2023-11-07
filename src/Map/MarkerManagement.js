// Import necessary OpenLayers classes
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Icon, Style } from 'ol/style';
import { transformExtent, fromLonLat } from 'ol/proj';
import { fetchSensorCommunityData, getSensorMarkerIconUrl } from '../api/SensorCommunityAPI';
import { fetchAQIData } from '../api/AQIAPI';

// This function updates the markers on the map based on the current viewport.
export const updateMarkersBasedOnViewport = (view, map1, map2, markerSource) => {
  const extent = view.calculateExtent(map1.getSize());
  const bounds = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
  const boundsString = `${bounds[3]},${bounds[0]},${bounds[1]},${bounds[2]}`;
  populateMarkersFromSensorCommunity(markerSource);
  populateMarkersFromAQI(boundsString, markerSource);
};

// This function populates markers from the Sensor Community API.
export const populateMarkersFromSensorCommunity = (markerSource, latitude_center = 49.7913, longitude_center = 9.9538, delta = 0.2) => {
  fetchSensorCommunityData(latitude_center, longitude_center, delta).then((filtered_data) => {
    filtered_data.forEach((measurement) => {
      if (measurement.location && measurement.sensordatavalues) {
        const pm10Value = measurement.sensordatavalues.find((v) => v.value_type === 'P1')?.value;
        const iconUrl = getSensorMarkerIconUrl(pm10Value);
        const iconStyle = new Style({
          image: new Icon({
            src: iconUrl,
            scale: 0.3,
          }),
        });

        const marker = new Feature({
          geometry: new Point(fromLonLat([measurement.location.longitude, measurement.location.latitude])),
          info: `${measurement.location.city}:<br>${measurement.sensordatavalues.map((value) => `${value.value_type}: ${value.value}<br>`).join('')}`,
        });
        marker.setStyle(iconStyle);

        markerSource.addFeature(marker);
      }
    });
  });
};

// This function populates markers from the Air Quality Index API.
export const populateMarkersFromAQI = (bounds, markerSource) => {
  fetchAQIData(bounds).then((data) => {
    if (data.status === 'ok') {
      data.data.forEach((station) => {
        const icon = new Style({
          image: new Icon({
            src: `https://waqi.info/mapicon/${station.aqi}.30.png`,
            scale: 0.3,
          }),
        });

        const marker = new Feature({
          geometry: new Point(fromLonLat([station.lon, station.lat])),
          info: station.station.name,
        });
        marker.setStyle(icon);

        markerSource.addFeature(marker);
      });
    }
  });
};
