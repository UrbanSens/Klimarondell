import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collection } from 'ol';
import { Draw, Modify, Translate } from 'ol/interaction';

class DrawingComponent extends Component {
  static propTypes = {
    map: PropTypes.object.isRequired,
    vectorSource: PropTypes.object.isRequired,
    drawnFeatures: PropTypes.instanceOf(Collection).isRequired,
    drawType: PropTypes.string.isRequired,
    onDrawTypeChange: PropTypes.func.isRequired,
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
    if (this.draw) {
      this.props.map.removeInteraction(this.draw);
      this.props.map.removeInteraction(this.modify);
      this.props.map.removeInteraction(this.translate);
    }

    if (this.props.drawType !== 'None') {
      this.draw = new Draw({
        source: this.props.vectorSource,
        type: this.props.drawType,
      });
      this.draw.on('drawend', () => {
        this.props.onDrawTypeChange('None');
      });
      this.props.map.addInteraction(this.draw);
    }

    this.modify = new Modify({ source: this.props.vectorSource });
    this.props.map.addInteraction(this.modify);

    this.updateTranslateInteraction();
  }

  updateTranslateInteraction = () => {
    if (this.translate) {
      this.props.map.removeInteraction(this.translate);
    }
    const translateFeatures = new Collection(this.props.vectorSource.getFeatures());
    this.translate = new Translate({
      features: translateFeatures,
    });
    this.props.map.addInteraction(this.translate);
  };

  render() {
    return null;
  }
}

export default DrawingComponent;
