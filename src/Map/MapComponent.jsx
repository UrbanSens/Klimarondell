import React, { Component } from "react";
import PropTypes from "prop-types";
import { Map, View, Collection } from "ol";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { transform } from "ol/proj";
import { Icon, Style } from "ol/style";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import DrawingComponent from "../Controls/DrawingComponent";
import HistogramPlot from "../components/HistogramPlot";
import {
  createPositronLayer,
  mapboxSatelliteLayer,
  geoServerLayer1,
  geoServerLayer2,
  geoServerLayer3,
  geoServerLayer4,
} from "./LayerConfig";
import {
  updateMarkersBasedOnViewport,
  populateMarkersFromSensorCommunity,
  populateMarkersFromAQI,
} from "./MarkerManagement";
import "../Controls/DrawingComponent.css";
import { fetchHealthcareDistribution } from "../api/HealthcareService"; // Adjust the import path as needed
import index from "../index.css";
import { Control, defaults as defaultControls } from "ol/control";
import { SlidingWindow } from "../components/SlidingWindow";
import "./MapComponent.css";
import { DegreeControl } from "./Grid"; // Corrected import statement
import { defaultInteractions } from "ol/interaction";
import TemperatureTimeSeries from "../components/TemperatureTimeSeries"; // Adjust the path as necessary
import { fetchSensorCommunityData } from "../api/SensorCommunityAPI"; // Adjust the path to where your API functions are located
import handleMapClick from "../Controls/mapClickHandler";
import _ from "lodash";
import HeaderBar from "../components/HeaderBar";
import "./MapComponentDarkmode.css";
import { rawLayers, smoothLayers } from "../Controls/LSTSlider"; // Adjust the import path as necessary.

// calculate distance to station
// Add a utility function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

// Create a new control to add to the map
class LogoControl extends Control {
  constructor(options = {}) {
    const element = document.createElement("div");
    element.className = "ol-control map-logo";
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
      drawType: "None",
      drawnFeatures: [],
      showDrawingOptions: false,
      triggerHeartbeat: false, // New state to control the heartbeat animation
      triggerControlsHeartbeat: false, // New state to control the heartbeat animation
      healthcareData: null,
      temperatureData: [], // Initialize temperatureData to an empty array
      isWindowOpen: false, // State to control the visibility of the sliding window
      isControlsWindowOpen: false, // State to control the visibility of the controls window
      layerOpacity: 0.5, // Initialize layer opacity to 50%
      currentLayerIndex: 0, // Add this new state property
      isRawLayerVisible: false, // State to control the visibility of the raw layer
      darkMode: false,
      searchSuggestions: [],
    };
  }

  // This method is called when a suggestion is clicked
  handleSuggestionClick = (suggestion) => {
    this.searchAddress(suggestion.place_name);
    this.setState({ searchSuggestions: [] }); // Clear suggestions to hide the dropdown
  };

  searchAddress = (address) => {
    // ... existing fetch logic ...
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          const [longitude, latitude] = data.features[0].center;
          // Animate the map view to the selected location
          this.map1.getView().animate({
            center: fromLonLat([longitude, latitude]),
            zoom: 20, // The zoom level you want to end at
            duration: 2000, // Duration of the animation in milliseconds
          });
        } else {
          console.log("No results found");
        }
      })
      .catch((error) => console.error("Error:", error));
    // After a successful address search, trigger the heartbeat
    this.setState({ triggerHeartbeat: true });
  };

  updateSearch = (address) => {
    if (address.length > 2) {
      // To avoid too many requests, start searching after 2 characters
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features) {
            this.setState({ searchSuggestions: data.features });
          }
        })
        .catch((error) => console.error("Error:", error));
    } else {
      this.setState({ searchSuggestions: [] }); // Clear suggestions if the input is too short
    }
  };

  handleSearchKeyPress = (event) => {
    this.updateSearch(event.target.value); // Call updateSearch on input change instead

    if (event.key === "Enter") {
      // ... existing code to handle Enter press
    }
  };

  toggleDarkMode = () => {
    this.setState(
      (prevState) => ({
        darkMode: !prevState.darkMode,
      }),
      () => {
        // Update the positronLayer using the createPositronLayer function
        const newPositronLayer = createPositronLayer(this.state.darkMode);
        this.map2.getLayers().setAt(0, newPositronLayer);
      }
    );
  };

  setInitialLayerVisibility = () => {
    const { isRawLayerVisible } = this.state;
    rawLayers.forEach((layer) => layer.setVisible(isRawLayerVisible));
    smoothLayers.forEach((layer) => layer.setVisible(!isRawLayerVisible));
  };

  componentDidMount() {
    this.initializeMaps();
    this.setInitialLayerVisibility();
  }

  initializeMaps = () => {
    const vectorLayer = new VectorLayer({ source: this.vectorSource });

    this.view = new View({
      center: fromLonLat([9.930745, 49.792409]),
      zoom: 14,
    });

    const logoControl = new LogoControl();

    // Set the initial visibility based on the state
    // Set the initial visibility based on the state
    //geoServerLayer1.setVisible(!this.state.isRawLayerVisible); // Change this line
    //geoServerLayer4.setVisible(this.state.isRawLayerVisible);  // Change this line

    // Check for system preference for dark mode and update the state accordingly
    const prefersDarkMode =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.setState({ darkMode: prefersDarkMode });

    //store the temperature from stations data
    this.fetchTemperatureData();

    this.map1 = new Map({
      target: this.map1Ref.current,
      layers: [
        mapboxSatelliteLayer,
        ...rawLayers, // Spread the rawLayers array
        ...smoothLayers, // Spread the smoothLayers array
        //geoServerLayer1,
        //geoServerLayer4,
        this.markerLayer,
        vectorLayer,
      ],
      view: this.view,
      controls: defaultControls({ zoom: false, rotate: false }).extend([
        logoControl,
      ]), // Disable default zoom and rotate controls
    });

    const clonedVectorSource = new VectorSource();
    const clonedVectorLayer = new VectorLayer({ source: clonedVectorSource });

    this.vectorSource.on("addfeature", (event) => {
      const clonedFeature = event.feature.clone();
      clonedVectorSource.addFeature(clonedFeature);
      this.drawnFeatures.push(event.feature);
      this.setState({
        drawnFeatures: [...this.state.drawnFeatures, event.feature],
      });
    });

    this.vectorSource.on("removefeature", (event) => {
      const featureToRemove = clonedVectorSource
        .getFeatures()
        .find((f) => f.getId() === event.feature.getId());
      if (featureToRemove) {
        clonedVectorSource.removeFeature(featureToRemove);
      }
    });

    const clonedMarkerLayer = new VectorLayer({ source: new VectorSource() });
    clonedMarkerLayer
      .getSource()
      .addFeatures(this.markerSource.getFeatures().map((f) => f.clone()));

    // Here we call getPositronLayer with the current darkMode state to get the correct layer
    const positronLayer = createPositronLayer(this.state.darkMode);

    this.map2 = new Map({
      target: this.map2Ref.current,
      layers: [
        positronLayer,
        //...rawLayers, // Spread the rawLayers array
        //...smoothLayers, // Spread the smoothLayers array
        //geoServerLayer2,
        //geoServerLayer3,
        clonedVectorLayer,
        clonedMarkerLayer,
      ],
      view: this.view,
      controls: defaultControls({ zoom: false, rotate: false }).extend([
        logoControl,
      ]),
    });

    const mapClickHandler = handleMapClick(
      this.map2,
      this.view,
      this.setState.bind(this)
    ); // Bind the setState function to the handler
    this.map2.on("singleclick", mapClickHandler); // Register the handler for the singleclick event

    // Create DegreeControl for the second map and add it
    const degreeControlMap2 = new DegreeControl({ map: this.map2 });
    this.map2.addControl(degreeControlMap2);

    // Update the degrees when the map is moved
    this.map2.on("postrender", () => degreeControlMap2.updateDegrees());

    // Add the markers to the map
    this.map1.on("moveend", this.updateMarkersBasedOnViewport);
    this.map2.on("moveend", this.updateMarkersBasedOnViewport);
    this.updateMarkersBasedOnViewport();
  };

  updateMarkersBasedOnViewport = () => {
    updateMarkersBasedOnViewport(
      this.view,
      this.map1,
      this.map2,
      this.markerSource
    );
  };

  handleDrawTypeChange = (drawType) => {
    this.setState({ drawType });
  };

  handleUndo = () => {
    if (this.drawnFeatures.getLength() > 0) {
      const lastFeature = this.drawnFeatures.item(
        this.drawnFeatures.getLength() - 1
      );
      this.vectorSource.removeFeature(lastFeature);
      this.drawnFeatures.remove(lastFeature);
    }
  };

  handlePolygonDrawn = (event) => {
    const feature = event.feature;
    const geometry = feature.getGeometry();
    const coordinates = geometry
      .getCoordinates()[0]
      .map((coord) => transform(coord, "EPSG:3857", "EPSG:4326"));
    const coordString = coordinates
      .map((coord) => `${coord[0]} ${coord[1]}`)
      .join(", ");
    const polygonCoords = `${coordString}, ${coordinates[0][0]} ${coordinates[0][1]}`; // Ensuring the polygon is closed
    this.fetchAndSetHealthcareData(polygonCoords);
    // Trigger the heartbeat for the window-controls
    this.setState({ triggerControlsHeartbeat: true });
  };

  // Method to stop the heartbeat when window-controls are interacted with
  stopControlsHeartbeat = () => {
    this.setState({ triggerControlsHeartbeat: false });
  };
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Fetch the healthcare data from the server
  fetchAndSetHealthcareData = (polygonCoords) => {
    fetchHealthcareDistribution(polygonCoords)
      .then((parsedData) => this.setState({ healthcareData: parsedData }))
      .catch((error) =>
        console.error("Error fetching healthcare distribution data:", error)
      );
  };

  //fetch the temperature data from the stations
  // Modify the fetchTemperatureData method in your MapComponent class
  // Fetch the temperature data from the closest station

  fetchTemperatureData = () => {
    const cityCenter = [9.930745, 49.792409]; // Coordinates for Würzburg city center
    const delta = 0.1; // This is an example delta value for 10 km, adjust as necessary
    const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));

    fetchSensorCommunityData(cityCenter[1], cityCenter[0], delta)
      .then((data) => {
        // Filter out stations with no temperature data and timestamps older than one week
        const filteredData = data.filter((station) => {
          const tempValue = station.sensordatavalues.find(
            (val) => val.value_type === "temperature"
          );
          const timestamp = new Date(station.timestamp);
          return tempValue && timestamp >= oneWeekAgo;
        });

        // Map the data to an array of { timestamp, value } objects
        const temperatureData = filteredData.map((station) => ({
          timestamp: station.timestamp,
          value: parseFloat(
            station.sensordatavalues.find(
              (val) => val.value_type === "temperature"
            ).value
          ),
        }));

        // Set the state with the temperature data
        this.setState({ temperatureData });
      })
      .catch((error) => {
        console.error("Error fetching temperature data:", error);
      });
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Handler to toggle the sliding window

  toggleSlidingWindow = () => {
    this.setState((prevState) => ({ isWindowOpen: !prevState.isWindowOpen }));
  };

  // Handler to toggle the controlwindow
  toggleControlsWindow = () => {
    this.setState((prevState) => ({
      isControlsWindowOpen: !prevState.isControlsWindowOpen,
      // Stop the heartbeat when the control window is opened
      triggerControlsHeartbeat: !prevState.isControlsWindowOpen ? false : prevState.triggerControlsHeartbeat,
    }));
  };
  

  // Handler for opacity change
  handleLayerOpacityChange = (event) => {
    const newOpacity = parseFloat(event.target.value);
    this.setState({ layerOpacity: newOpacity });

    // Call the throttled function
    this.throttledUpdateOpacity(newOpacity);
  };

  throttledUpdateOpacity = _.throttle((newOpacity) => {
    [...rawLayers, ...smoothLayers].forEach((layer) =>
      layer.setOpacity(newOpacity)
    );
  }, 100);

  // Throttled function to update layer opacity
  /*throttledUpdateOpacity = _.throttle((newOpacity) => {
    geoServerLayer1.setOpacity(newOpacity);
    geoServerLayer4.setOpacity(newOpacity);
  }, 100); // Adjust the throttle time as needed

  // Handler for the layer switch
/*handleLayerSwitch = () => {
  this.setState(prevState => ({
    isRawLayerVisible: !prevState.isRawLayerVisible
  }), () => {
    if (this.state.isRawLayerVisible) {
      geoServerLayer1.setVisible(false);
      geoServerLayer4.setVisible(true);
    } else {
      geoServerLayer1.setVisible(true);
      geoServerLayer4.setVisible(false);
    }
  });
}; */

  handleLayerSwitch = () => {
    this.setState(
      (prevState) => ({
        isRawLayerVisible: !prevState.isRawLayerVisible,
      }),
      () => {
        rawLayers.forEach((layer) =>
          layer.setVisible(this.state.isRawLayerVisible)
        );
        smoothLayers.forEach((layer) =>
          layer.setVisible(!this.state.isRawLayerVisible)
        );
      }
    );
  };

  // Method to update the current layer based on the slider value
  handleSliderChange = (event) => {
    const index = parseInt(event.target.value, 10);

    // Hide all layers in map1
    [...rawLayers, ...smoothLayers].forEach((layer) => {
      layer.setVisible(false);
      // You might need to remove them from map2 if they were added previously
      // this.map2.removeLayer(layer);
    });

    // Show only the selected layer in map1
    rawLayers[index].setVisible(true);
    smoothLayers[index].setVisible(true);

    // Update the state
    this.setState({ currentLayerIndex: index });
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////Rendering/////////////////////////////////////////////////////////////

  toggleDrawingOptions = () => {
    this.setState((prevState) => ({
      showDrawingOptions: !prevState.showDrawingOptions,
      triggerHeartbeat: false, // Stop the heartbeat when the button is clicked
    }));
  };

  renderDrawingControls() {
    const { showDrawingOptions, drawType, triggerHeartbeat } = this.state;
    return (
      <div className="drawing-controls-container">
        <button
          className={`round-button ${triggerHeartbeat ? "heartbeat" : ""}`}
          onClick={this.toggleDrawingOptions}
        >
          <span role="img" aria-label="Pencil">
            ✏️
          </span>
        </button>
        <div className={`drawing-options ${showDrawingOptions ? "show" : ""}`}>
          <label>Select Geometry:</label>
          <select
            onChange={(e) => this.handleDrawTypeChange(e.target.value)}
            value={drawType}
          >
            <option value="Polygon">Polygon</option>
            <option value="Circle">Circle</option>
            <option value="None">None</option>
          </select>
          <button onClick={this.handleUndo}>Undo</button>
        </div>
      </div>
    );
  }

  renderColorScale() {
    const colorScaleStyle = {
      background:
        "linear-gradient(to right, " +
        "#2166ac 0%, #4393c3 10%, #92c5de 20%, " +
        "#d1e5f0 30%, #f7f7f7 40%, #fddbc7 50%, " +
        "#f4a582 60%, #d6604d 70%, #b2182b 80%, " +
        "#67001f 100%)",
      height: "25px",
      width: "100%",
      borderRadius: "5px",
      marginTop: "10px",
      position: "relative",
    };

    return (
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <div style={colorScaleStyle} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "5px",
          }}
        >
          {[0, 45].map((value, index, array) => (
            <span
              key={value}
              style={{
                flex:
                  index === 0 || index === array.length - 1 ? "0 0 auto" : "1",
              }}
            >
              {value}°
            </span>
          ))}
        </div>
      </div>
    );
  }

  render() {
    const {
      isWindowOpen,
      darkMode,
      isControlsWindowOpen,
      layerOpacity,
      isRawLayerVisible,
      temperatureData,
      healthcareData,
      triggerControlsHeartbeat,
    } = this.state;

    return (
      <div className={this.state.darkMode ? "dark-mode" : ""}>
        <HeaderBar darkMode={darkMode} /> {/* Add this line */}
        <div
          ref={this.map1Ref}
          className="map"
          style={{ width: "50%", float: "left" }}
        >
          {/* Button to toggle control window for the left map */}
          <button
            className={`toggle-window-controls ${
              triggerControlsHeartbeat ? "heartbeat" : ""
            }`}
            onClick={this.toggleControlsWindow}
          >
            {isControlsWindowOpen ? "Close Controls" : "Open Controls"}
          </button>

          {/* Control window content for the left map */}
          {isControlsWindowOpen && (
            <div className="window-controls open">
              <div className="switch-container">
                <span
                  className="switch-label"
                  style={{ fontFamily: "Roboto Mono" }}
                >
                  Raw
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={this.state.isRawLayerVisible}
                    onChange={this.handleLayerSwitch}
                  />
                  <span className="slider round"></span>
                </label>
                <span
                  className="switch-label"
                  style={{ fontFamily: "Roboto Mono" }}
                >
                  Smooth
                </span>
              </div>
              {this.renderColorScale()}
              <div className="slider-container">
                <p className="slider-text">Layer Opacity:</p>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={this.state.layerOpacity}
                  onChange={this.handleLayerOpacityChange}
                  className="opacity-slider"
                />
              </div>
            </div>
          )}

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
        </div>
        <div
          ref={this.map2Ref}
          className="map"
          style={{ width: "50%", float: "left", position: "relative" }} // Ensure this div has a relative position
        >
          {/* Existing elements for the right map */}
          <div
            id="search-container"
            style={{
              position: "absolute",
              top: "30px",
              left: "20px",
              zIndex: 1000,
            }}
          >
            <input
              type="text"
              id="address-search"
              placeholder="Enter an address..."
              onChange={this.handleSearchKeyPress}
            />
            {this.state.searchSuggestions.length > 0 && (
              <ul className="search-suggestions">
                {this.state.searchSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    onMouseDown={() => this.handleSuggestionClick(suggestion)}
                  >
                    {suggestion.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ...possibly other elements here... */}

          {/* Existing elements for the right map */}

          {/* Slider and labels for layer control */}
          <div
            style={{
              position: "absolute",
              bottom: "70px", // Distance from the bottom
              left: "50%",
              transform: "translateX(-50%)", // This centers the slider
              zIndex: 1000, // Ensure this is on top of map elements
            }}
          >
            <div
              style={{
                fontFamily: "Roboto Mono",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ marginRight: "10px" }}>Time: 2018</span>
              <input
                type="range"
                min="0"
                max={rawLayers.length - 1}
                value={this.state.currentLayerIndex}
                onChange={this.handleSliderChange}
                className="layer-slider"
                style={{ width: "200px" }} // Adjust as needed
              />
              <span style={{ marginLeft: "10px" }}>Now</span>
            </div>
          </div>

          {/* Button to toggle dark mode, positioned in the upper right of map2 */}
          <button
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 1000, // Ensure this button is on top of the map elements
            }}
            onClick={this.toggleDarkMode}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
        {/* Button to toggle statistics sliding window */}
        <button
          className="toggle-stats-button"
          onClick={this.toggleSlidingWindow}
        >
          Toggle Statistics
        </button>
        {/* Statistics sliding window content */}
        <SlidingWindow isOpen={isWindowOpen}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "100%",
            }}
          >
            <div style={{ width: "25%", paddingRight: "10px" }}>
              <TemperatureTimeSeries data={temperatureData} />
            </div>
            <div style={{ width: "25%", paddingLeft: "10px" }}>
              {healthcareData && <HistogramPlot data={healthcareData} />}
            </div>
            {/* ...possibly other elements here... */}
          </div>
        </SlidingWindow>
      </div>
    );
  }
}

export default MapComponent;
