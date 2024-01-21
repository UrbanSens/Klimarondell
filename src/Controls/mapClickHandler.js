// If getLayerByName is defined in another file, you should import it:
// import { getLayerByName } from 'wherever-this-function-is-defined';

const getLayerByName = (map, name) => {
    let layer;
    map.getLayers().forEach(function (lyr) {
      if (lyr.get('name') === name) {
        layer = lyr;
      }
    });
    return layer;
  };
  
  // Make sure to pass setState as a parameter to the handleMapClick function
  const handleMapClick = (map, view, setState) => (evt) => {
    const layer = getLayerByName(map, 'geoServerLayer3');
    if (!layer) {
      console.error('Layer not found');
      return;
    }
  
    // Now use the found layer
    const url = layer.getSource().getFeatureInfoUrl(
      evt.coordinate,
      view.getResolution(),
      view.getProjection(),
      { 'INFO_FORMAT': 'application/json' }
    );
  
    if (url) {
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          const features = json.features;
          if (features && features.length > 0) {
            const properties = features[0].properties;
            setState({ selectedStadtbezirk: properties.Stadtbezirk });
          }
        })
        .catch((error) => {
          console.error("Error during GetFeatureInfo request:", error);
        });
    }
  };
  
  export default handleMapClick;
  