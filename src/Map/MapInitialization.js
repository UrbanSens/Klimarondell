import { Map, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { VectorLayer } from 'ol/layer';
import { VectorSource } from 'ol/source';
import { mapboxSatelliteLayer, geoServerLayer1, geoServerLayer2, positronLayer } from './LayerConfig';

export const initializeMaps = (map1Ref, map2Ref, vectorSource, markerLayer) => {
  const view = new View({
    center: fromLonLat([9.905299, 49.794111]),
    zoom: 13,
  });

  const map1 = new Map({
    target: map1Ref.current,
    layers: [mapboxSatelliteLayer, geoServerLayer1, markerLayer, new VectorLayer({ source: vectorSource })],
    view: view,
  });

  const clonedVectorSource = new VectorSource();
  const clonedMarkerLayer = new VectorLayer({ source: markerLayer.getSource().clone() });

  const map2 = new Map({
    target: map2Ref.current,
    layers: [positronLayer, geoServerLayer2, clonedMarkerLayer, new VectorLayer({ source: clonedVectorSource })],
    view: view,
  });

  return { map1, map2, view };
};
