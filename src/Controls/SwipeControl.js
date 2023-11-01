import React, { Component } from 'react';
import './SwipeControl.css';

class SwipeControl extends Component {
  state = {
    left: '50%',
  };

  componentDidMount() {
    const { map1, map2 } = this.props;
    const swipe = document.getElementById('swipe');

    let isSwiping = false;

    const startSwiping = () => {
      isSwiping = true;
    };

    const stopSwiping = () => {
      isSwiping = false;
    };

    const doSwipe = (event) => {
      if (!isSwiping || !map1 || !map2) return;

      const mapRect = map1.getTargetElement().getBoundingClientRect();
      const swipePosition = event.clientX - mapRect.left;
      const proportion = swipePosition / mapRect.width;
      const leftPercentage = (proportion * 100) + '%';

      this.setState({ left: leftPercentage });

      swipe.style.left = leftPercentage;

      // Apply the clip to the second map's layers
      const layers1 = map1.getLayers().getArray();
      const layers2 = map2.getLayers().getArray();

      layers1.forEach(layer => {
        layer.on('prerender', function (event) {
          const ctx = event.context;
          const width = ctx.canvas.width * (1 - proportion);

          ctx.save();
          ctx.beginPath();
          ctx.rect(width, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.clip();
        });

        layer.on('postrender', function (event) {
          const ctx = event.context;
          ctx.restore();
        });
      });

      layers2.forEach(layer => {
        layer.on('prerender', function (event) {
          const ctx = event.context;
          const width = ctx.canvas.width * proportion;

          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, width, ctx.canvas.height);
          ctx.clip();
        });

        layer.on('postrender', function (event) {
          const ctx = event.context;
          ctx.restore();
        });
      });

      // Redraw the maps
      map1.renderSync();
      map2.renderSync();
    };

    swipe.addEventListener('mousedown', startSwiping);
    document.addEventListener('mousemove', doSwipe);
    document.addEventListener('mouseup', stopSwiping);

    return () => {
      swipe.removeEventListener('mousedown', startSwiping);
      document.removeEventListener('mousemove', doSwipe);
      document.removeEventListener('mouseup', stopSwiping);
    };
  }

  render() {
    return <div id="swipe" className="swipe-control" style={{ left: this.state.left }}></div>;
  }
}

export default SwipeControl;
