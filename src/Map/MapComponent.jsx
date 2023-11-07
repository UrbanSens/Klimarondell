import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, View, Collection } from 'ol';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { transform } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import DrawingComponent from '../Controls/DrawingComponent';
import HistogramPlot from '../components/HistogramPlot';
import { positronLayer, mapboxSatelliteLayer, geoServerLayer1, geoServerLayer2 } from './LayerConfig';
import { updateMarkersBasedOnViewport, populateMarkersFromSensorCommunity, populateMarkersFromAQI } from './MarkerManagement';
import '../Controls/DrawingComponent.css';
import { fetchHealthcareDistribution } from '../api/HealthcareService'; // Adjust the import path as needed
import index from '../index.css';
import { Control, defaults as defaultControls } from 'ol/control';


// Remove the 'height' from styleMap, it's not needed anymore
const styleMap = {
    width: '50%',
    float: 'left',
    height: '100vh',
};


// Create a new control to add to the map
class LogoControl extends Control {
    constructor(options = {}) {
      const element = document.createElement('div');
      element.className = 'ol-control map-logo';
      element.innerHTML = `<a href="http://urbansens.de/" target="_blank"><img src="/logo02.png" alt="Logo"></a>`; // Make the logo a link
  
      super({
        element: element,
        target: options.target,
      });
    }
  }
  

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
    this.map1Ref = React.createRef();
    this.map2Ref = React.createRef();
    this.state = {
      drawType: 'None',
      drawnFeatures: [],
      healthcareData: null,
    };
  }

  componentDidMount() {
    this.initializeMaps();
  }

  initializeMaps = () => {
    const vectorLayer = new VectorLayer({ source: this.vectorSource });

    this.view = new View({
      center: fromLonLat([9.930745, 49.792409]),
      zoom: 14,
    });

    // Instantiate the custom LogoControl
  // Instantiate the custom LogoControl
  const logoControl = new LogoControl();

  this.map1 = new Map({
    target: this.map1Ref.current,
    layers: [mapboxSatelliteLayer, geoServerLayer1, this.markerLayer, vectorLayer],
    view: this.view,
    controls: defaultControls().extend([logoControl]), // Use defaults() function
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
        controls: defaultControls().extend([logoControl]), // Use defaults() function
      });

    this.map1.on('moveend', this.updateMarkersBasedOnViewport);
    this.map2.on('moveend', this.updateMarkersBasedOnViewport);
    this.updateMarkersBasedOnViewport();
  };

  updateMarkersBasedOnViewport = () => {
    updateMarkersBasedOnViewport(this.view, this.map1, this.map2, this.markerSource);
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
          <option value="Polygon">Polygon</option>
          <option value="Circle">Circle</option>
          <option value="None">None</option>
        </select>
        <button onClick={this.handleUndo}>Undo</button>
      </div>
    );
  }

  handlePolygonDrawn = (event) => {
    const feature = event.feature;
    const geometry = feature.getGeometry();
    const coordinates = geometry.getCoordinates()[0].map(coord => transform(coord, 'EPSG:3857', 'EPSG:4326'));
    const coordString = coordinates.map(coord => `${coord[0]} ${coord[1]}`).join(', ');
    const polygonCoords = `${coordString}, ${coordinates[0][0]} ${coordinates[0][1]}`; // Ensuring the polygon is closed
    this.fetchAndSetHealthcareData(polygonCoords); // Updated this line
  };

  // Fetches the healthcare distribution data from the Posgres database
  fetchAndSetHealthcareData = (polygonCoords) => {
    fetchHealthcareDistribution(polygonCoords)
      .then(parsedData => this.setState({ healthcareData: parsedData }))
      .catch(error => console.error('Error fetching healthcare distribution data:', error));
  };

  

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
            onDrawEnd={this.handlePolygonDrawn}
          />
        )}
        {this.renderDrawingControls()}
        {/* HistogramPlot is conditionally rendered if there is data */}
        {this.state.healthcareData && (
          <div style={{ position: 'absolute', right: '10px', bottom: '10px' }}>
            <HistogramPlot data={this.state.healthcareData} />
          </div>
        )}
      </div>
    );
    }
}

export default MapComponent;
