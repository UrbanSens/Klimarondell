import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { XYZ, TileWMS } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat, transformExtent } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { Collection } from 'ol';
import DrawingComponent from '../Controls/DrawingComponent';
import { fetchSensorCommunityData, getSensorMarkerIconUrl } from '../api/SensorCommunityAPI';
import { fetchAQIData } from '../api/AQIAPI';
import '../Controls/DrawingComponent.css'; // Replace with the correct path to your CSS file

#test

const styleMap = {
  width: '50%',
  height: '100vh',
  float: 'left',
};

const positronLayer = new TileLayer({
  source: new XYZ({
    url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attributions: '©OpenStreetMap, ©CartoDB',
  }),
});

const mapboxSatelliteLayer = new TileLayer({
    source: new XYZ({
      attributions: '©Mapbox, ©OpenStreetMap',
      url: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`,
      maxZoom: 19,
    }),
  });
  

const geoServerLayer1 = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:downscaled_LST_10', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
  }),
});

const geoServerLayer2 = new TileLayer({
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/urbansens/wms',
    params: { 'LAYERS': 'urbansens:merged_wue_lode', 'TILED': true },
    serverType: 'geoserver',
    transition: 0,
  }),
});

class MapComponent extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.vectorSource = new VectorSource();
    this.markerSource = new VectorSource();
    this.markerLayer = new VectorLayer({ source: this.markerSource });
    this.drawnFeatures = new Collection();
    this.allMarkers = {};
    this.map1Ref = React.createRef();
    this.map2Ref = React.createRef();
    this.state = {
      drawType: 'None',
      drawnFeatures: [],
    };
  }

  componentDidMount() {
    this.initializeMaps();
  }

  initializeMaps = () => {
    const vectorLayer = new VectorLayer({ source: this.vectorSource });

    this.view = new View({
      center: fromLonLat([9.9538, 49.7913]),
      zoom: 14,
    });

    this.map1 = new Map({
      target: this.map1Ref.current,
      layers: [mapboxSatelliteLayer, geoServerLayer1, this.markerLayer, vectorLayer],
      view: this.view,
    });

    const clonedVectorSource = new VectorSource();
    const clonedVectorLayer = new VectorLayer({ source: clonedVectorSource });

    this.vectorSource.on('addfeature', (event) => {
      const clonedFeature = event.feature.clone();
      clonedVectorSource.addFeature(clonedFeature);
      this.drawnFeatures.push(event.feature);
      this.setState({ drawnFeatures: [...this.state.drawnFeatures, event.feature] });
    });

    this.vectorSource.on('removefeature', (event) => {
      const featureToRemove = clonedVectorSource.getFeatures().find(f => f.getId() === event.feature.getId());
      if (featureToRemove) {
        clonedVectorSource.removeFeature(featureToRemove);
      }
    });

    const clonedMarkerLayer = new VectorLayer({ source: new VectorSource() });
    clonedMarkerLayer.getSource().addFeatures(this.markerSource.getFeatures().map(f => f.clone()));

    this.map2 = new Map({
      target: this.map2Ref.current,
      layers: [positronLayer, geoServerLayer2, clonedVectorLayer, clonedMarkerLayer],
      view: this.view,
    });

    this.map1.on('moveend', this.updateMarkersBasedOnViewport);
    this.map2.on('moveend', this.updateMarkersBasedOnViewport);
    this.updateMarkersBasedOnViewport();
  };

  updateMarkersBasedOnViewport = () => {
    const extent = this.view.calculateExtent(this.map1.getSize());
    const bounds = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    const boundsString = `${bounds[3]},${bounds[0]},${bounds[1]},${bounds[2]}`;
    this.populateMarkersFromSensorCommunity();
    this.populateMarkersFromAQI(boundsString);
  };

  populateMarkersFromSensorCommunity = () => {
    const latitude_center = 49.7913;
    const longitude_center = 9.9538;
    const delta = 0.2;

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
            info: `${measurement.location.city}:<br>${measurement.sensordatavalues
              .map((value) => `${value.value_type}: ${value.value}<br>`)
              .join('')}`,
          });
          marker.setStyle(iconStyle);

          this.allMarkers[measurement.id] = marker;
          this.markerSource.addFeature(marker);
        }
      });
    });
  };

  populateMarkersFromAQI = (bounds) => {
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

          this.allMarkers[station.uid] = marker;
          this.markerSource.addFeature(marker);
        });
      }
    });
  };

  handleDrawTypeChange = (drawType) => {
    this.setState({ drawType });
  };

  handleUndo = () => {
    if (this.drawnFeatures.getLength() > 0) {
      const lastFeature = this.drawnFeatures.item(this.drawnFeatures.getLength() - 1);
      this.vectorSource.removeFeature(lastFeature);
      this.drawnFeatures.remove(lastFeature);
    }
  };

  renderDrawingControls() {
    return (
      <div className="drawing-control">
        <label>Select Geometry:</label>
        <select onChange={(e) => this.handleDrawTypeChange(e.target.value)} value={this.state.drawType}>
          <option value="Point">Point</option>
          <option value="LineString">LineString</option>
          <option value="Polygon">Polygon</option>
          <option value="Circle">Circle</option>
          <option value="None">None</option>
        </select>
        <button onClick={this.handleUndo}>Undo</button>
      </div>
    );
  }

  render() {
    return (
      <div style={{ position: 'relative', height: '100vh' }}>
        <div ref={this.map1Ref} style={styleMap}></div>
        <div ref={this.map2Ref} style={styleMap}></div>
        {this.map1 && (
          <DrawingComponent
            map={this.map1}
            vectorSource={this.vectorSource}
            drawnFeatures={this.drawnFeatures}
            drawType={this.state.drawType}
            onDrawTypeChange={this.handleDrawTypeChange}
          />
        )}
        {this.renderDrawingControls()}
      </div>
    );
  }
}

export default MapComponent;
