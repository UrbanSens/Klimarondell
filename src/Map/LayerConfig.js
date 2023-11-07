import Tile from 'ol/layer/Tile';
import { XYZ, TileWMS } from 'ol/source';

export const positronLayer = new Tile({
    source: new XYZ({
      url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attributions: '©OpenStreetMap, ©CartoDB',
      // Add minZoom to limit zooming out
      minZoom: 15, // for example, adjust as necessary to only show Bavaria
    }),
  });
  
  export const mapboxSatelliteLayer = new Tile({
    source: new XYZ({
      attributions: '©Mapbox, ©OpenStreetMap',
      url: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`,
      maxZoom: 19,
      // Add minZoom to limit zooming out
      minZoom: 15, // for example, adjust as necessary to only show Bavaria
    }),
  });
  

export const geoServerLayer1 = new Tile({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/urbansens/wms',
      params: { 'LAYERS': 'urbansens:downscaled_LST_10', 'TILED': true },
      serverType: 'geoserver',
      transition: 0,
    }),
    opacity: 0.5, // 50% opacity
    visible: true, // Set layer as invisible
  });
  
  export const geoServerLayer2 = new Tile({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/urbansens/wms',
      params: { 'LAYERS': 'urbansens:merged_wue_lode', 'TILED': true },
      serverType: 'geoserver',
      transition: 0,
    }),
    opacity: 0.5, // 50% opacity
    visible: false, // Set layer as invisible
  });
  