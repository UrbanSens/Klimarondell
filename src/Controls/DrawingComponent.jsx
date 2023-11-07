// DrawingComponent.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Draw, Modify, Translate } from 'ol/interaction';
import { Collection } from 'ol';

class DrawingComponent extends Component {
  static propTypes = {
    map: PropTypes.object.isRequired,
    vectorSource: PropTypes.object.isRequired,
    drawnFeatures: PropTypes.instanceOf(Collection).isRequired,
    drawType: PropTypes.string.isRequired,
    onDrawTypeChange: PropTypes.func.isRequired,
    onDrawEnd: PropTypes.func.isRequired, // Ensure this prop is passed
  };

  constructor(props) {
    super(props);
    this.draw = null;
    this.modify = null;
    this.translate = null;
  }

  componentDidUpdate(prevProps) {
    if (this.props.drawType !== prevProps.drawType) {
      this.updateInteractions();
    }
  }

  componentWillUnmount() {
    if (this.draw) {
      this.props.map.removeInteraction(this.draw);
      this.props.map.removeInteraction(this.modify);
      this.props.map.removeInteraction(this.translate);
    }
  }

  updateInteractions() {
    // Remove previous interactions
    if (this.draw) {
      this.props.map.removeInteraction(this.draw);
      this.props.map.removeInteraction(this.modify);
      this.props.map.removeInteraction(this.translate);
    }

    // Add new interactions based on the selected drawType
    if (this.props.drawType !== 'None') {
      this.draw = new Draw({
        source: this.props.vectorSource,
        type: this.props.drawType,
      });
      // Listen for the end of the drawing and call the onDrawEnd prop
      this.draw.on('drawend', this.props.onDrawEnd); // Pass the event to the handler
      this.props.map.addInteraction(this.draw);
    }

    // Modify interaction
    this.modify = new Modify({ source: this.props.vectorSource });
    this.props.map.addInteraction(this.modify);

    // Translate interaction
    this.updateTranslateInteraction();
  }

  updateTranslateInteraction() {
    // Remove previous translate interaction
    if (this.translate) {
      this.props.map.removeInteraction(this.translate);
    }

    // Add new translate interaction
    const translateFeatures = new Collection(this.props.vectorSource.getFeatures());
    this.translate = new Translate({
      features: translateFeatures,
    });
    this.props.map.addInteraction(this.translate);
  }

  render() {
    return null; // No visual component is associated
  }
}

export default DrawingComponent;