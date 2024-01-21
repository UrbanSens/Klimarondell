import Tile from 'ol/layer/Tile';
import { XYZ, TileWMS } from 'ol/source';
import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';

// Mapbox style URLs
const mapboxLightStyleUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;
const mapboxDarkStyleUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;
const mapboxSatelliteStyleUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;

export const positronLayer = new Tile({
    source: new XYZ({
      url: mapboxLightStyleUrl,
      attributions: '©Mapbox, ©OpenStreetMap',
      minZoom: 15,
    }),
});

export function createPositronLayer(darkMode) {
  return new Tile({
    source: new XYZ({
      url: darkMode ? mapboxDarkStyleUrl : mapboxLightStyleUrl,
      attributions: '©Mapbox, ©OpenStreetMap',
      // ... other layer options ...
    }),
  });
}

export const mapboxSatelliteLayer = new Tile({
    source: new XYZ({
      attributions: '©Mapbox, ©OpenStreetMap',
      url: mapboxSatelliteStyleUrl,
      maxZoom: 19,
      minZoom: 15,
    }),
});



export const geoServerLayer1 = new Tile({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/urbansens/wms',
      params: { 'LAYERS': 'urbansens:downscaled_LST_10', 'TILED': true },
      serverType: 'geoserver',
      transition: 0,
      loadTilesWhileAnimating: false,
      loadTilesWhileInteracting: false,
    }),
    opacity: 0.5, // 50% opacity
    visible: false, // Set layer as invisible
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

  export const geoServerLayer4 = new Tile({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/urbansens/wms',
      params: { 'LAYERS': 'urbansens:downscaled_LST_10_smoothed', 'TILED': true },
      serverType: 'geoserver',
      transition: 0,
      loadTilesWhileAnimating: false,
      loadTilesWhileInteracting: false,
    }),
    opacity: 0.5, // 50% opacity
    visible: false, // Set layer as invisible
  });
  
  

  export const geoServerLayer3 = new Tile({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/urbansens/wms',
      params: { 'LAYERS': 'urbansens:stadtbezirke_data', 'TILED': true },
      serverType: 'geoserver',
      transition: 0,
    }),
    opacity: 0.2, // 50% opacity
    visible: false,
  });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//slider layers  ... 1-12 

export const geoServerLayerSlider1 = new Tile({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:LST_R_2018-06-01_2018-09-01', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
    loadTilesWhileAnimating: false,
    loadTilesWhileInteracting: false,
  }),
  opacity: 0.5, // 50% opacity
  visible: false, // Set layer as invisible
});

export const geoServerLayerSlider2 = new Tile({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:LST_R_2019-06-01_2019-09-01', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
    loadTilesWhileAnimating: false,
    loadTilesWhileInteracting: false,
  }),
  opacity: 0.5, // 50% opacity
  visible: false, // Set layer as invisible
});

export const geoServerLayerSlider3 = new Tile({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:LST_R_2020-06-01_2020-09-01', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
    loadTilesWhileAnimating: false,
    loadTilesWhileInteracting: false,
  }),
  opacity: 0.5, // 50% opacity
  visible: false, // Set layer as invisible
});

export const geoServerLayerSlider4 = new Tile({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:LST_R_2021-06-01_2021-09-01', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
    loadTilesWhileAnimating: false,
    loadTilesWhileInteracting: false,
  }),
  opacity: 0.5, // 50% opacity
  visible: false, // Set layer as invisible
});

export const geoServerLayerSlider5 = new Tile({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:LST_R_2022-06-01_2022-09-01', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
    loadTilesWhileAnimating: false,
    loadTilesWhileInteracting: false,
  }),
  opacity: 0.5, // 50% opacity
  visible: false, // Set layer as invisible
});

export const geoServerLayerSlider6 = new Tile({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:LST_R_2023-06-01_2023-09-01', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
    loadTilesWhileAnimating: false,
    loadTilesWhileInteracting: false,
  }),
  opacity: 0.5, // 50% opacity
  visible: false, // Set layer as invisible
});

export const geoServerLayerSlider7 = new Tile({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:LST_S_2018-06-01_2018-09-01', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
    loadTilesWhileAnimating: false,
    loadTilesWhileInteracting: false,
  }),
  opacity: 0.5, // 50% opacity
  visible: false, // Set layer as invisible
});

export const geoServerLayerSlider8 = new Tile({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:LST_S_2019-06-01_2019-09-01', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
    loadTilesWhileAnimating: false,
    loadTilesWhileInteracting: false,
  }),
  opacity: 0.5, // 50% opacity
  visible: false, // Set layer as invisible
});

export const geoServerLayerSlider9 = new Tile({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:LST_S_2020-06-01_2020-09-01', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
    loadTilesWhileAnimating: false,
    loadTilesWhileInteracting: false,
  }),
  opacity: 0.5, // 50% opacity
  visible: false, // Set layer as invisible
});

export const geoServerLayerSlider10 = new Tile({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:LST_S_2021-06-01_2021-09-01', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
    loadTilesWhileAnimating: false,
    loadTilesWhileInteracting: false,
  }),
  opacity: 0.5, // 50% opacity
  visible: false, // Set layer as invisible
});

export const geoServerLayerSlider11 = new Tile({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:LST_S_2022-06-01_2022-09-01', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
    loadTilesWhileAnimating: false,
    loadTilesWhileInteracting: false,
  }),
  opacity: 0.5, // 50% opacity
  visible: false, // Set layer as invisible
});

export const geoServerLayerSlider12 = new Tile({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:LST_S_2023-06-01_2023-09-01', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
    loadTilesWhileAnimating: false,
    loadTilesWhileInteracting: false,
  }),
  opacity: 0.5, // 50% opacity
  visible: false, // Set layer as invisible
});