import { Control } from 'ol/control';
import { toLonLat, fromLonLat } from 'ol/proj';
import { getPointResolution } from 'ol/proj';

// Helper method to create a formatted degree label
function createFormattedDegreeLabel(degreeValue) {
    const formattedDegree = document.createElement('span');

    // Check for 'E' or 'N' in the degree value
    let degreeParts;
    if (degreeValue.includes('E')) {
        degreeParts = degreeValue.split('E');
    } else if (degreeValue.includes('N')) {
        degreeParts = degreeValue.split('N');
    } else {
        // If neither 'E' nor 'N', just return the original value
        formattedDegree.textContent = degreeValue;
        return formattedDegree;
    }
    
    // Create the numeric part of the degree
    const numberSpan = document.createElement('span');
    numberSpan.textContent = degreeParts[0];
    formattedDegree.appendChild(numberSpan);

    // Create the directional part of the degree ('E' or 'N')
    const letterSpan = document.createElement('span');
    letterSpan.textContent = (degreeValue.includes('E') ? 'E' : 'N'); // Append '-' to 'E' or 'N'
    letterSpan.style.fontSize = 'larger'; // Make the letter larger
    formattedDegree.appendChild(letterSpan);

    return formattedDegree;
}



export class DegreeControl extends Control {
  constructor(options = {}) {
    const element = document.createElement('div');
    element.className = 'degree-control';

    super({
      element: element,
      target: options.target
    });

    this.map = options.map; // Store the map instance

    // Create labels for the top and right
    this.labels = {
      topLeft25: this.createLabel('degree-labels-top-left-25'),
      topLeft75: this.createLabel('degree-labels-top-left-75'),
      rightTop25: this.createLabel('degree-labels-right-top-25'),
      rightTop75: this.createLabel('degree-labels-right-top-75'),
    };

    // Append labels to the degree-control container
    Object.values(this.labels).forEach(label => this.element.appendChild(label));
  }

  // Helper method to create a label
createLabel(className) {
    const label = document.createElement('div');
    label.className = className;
    return label;
}

// Helper method to apply styles to a label
applyLabelStyles(label) {
    label.style.fontFamily = 'Roboto Mono, monospace'; // Set the font family to Roboto Mono
    label.style.color = '#094c72'; // Set the text color to the specified blue
    label.style.background = 'rgba(0, 76, 114, 0)'; // Set a translucent blue background
    label.style.padding = '2px 5px';
    label.style.borderRadius = '3px';
    label.style.pointerEvents = 'none';
}

  
  // Helper method to position a label
  positionLabel(label, edge, position) {
    label.style.position = 'absolute';
    label.style[edge] = '10px';
    label.style.transform = edge === 'top' ? `translateX(-50%)` : `translateY(-50%)`;
    label.style.zIndex = '5';
    label.style[edge === 'top' ? 'left' : 'top'] = position;
    // Other styles like padding, borderRadius already set in createLabel
  }
  

  updateDegrees() {
    if (!this.map) return;

    const view = this.map.getView();
    const center = toLonLat(view.getCenter());
    const resolution = view.getResolution();
    const projection = view.getProjection();
    const pointResolution = getPointResolution(projection, resolution, center);

    // Define a distance for the grid
    const gridDistance = 500; // Distance in meters for each grid step

    // Calculate the degrees for each grid step
    const degreeStep = gridDistance / pointResolution;
    const latDegreeStep = degreeStep / (111.32 * 1000); // Convert meters to latitude degrees
    const lonDegreeStep = degreeStep / (40075000 * Math.cos(Math.PI * center[1] / 180) / 360); // Convert meters to longitude degrees

    // Calculate the new coordinates for labels
    const topLat25 = center[1] - latDegreeStep * 0.25; // 25% position from center to top
    const topLat75 = center[1] + latDegreeStep * 0.25; // 75% position from center to top
    const rightLon25 = center[0] + lonDegreeStep * 0.25; // 25% position from center to right
    const rightLon75 = center[0] + lonDegreeStep * 0.75; // 75% position from center to right

    // Update and style the label contents
    const topLeft25Content = createFormattedDegreeLabel(`${topLat25.toFixed(2)}°N`);
    this.labels.topLeft25.innerHTML = ''; // Clear any existing content
    this.labels.topLeft25.appendChild(topLeft25Content);
    this.applyLabelStyles(this.labels.topLeft25); // Call the method with 'this'

    const topLeft75Content = createFormattedDegreeLabel(`${topLat75.toFixed(2)}°N`);
    this.labels.topLeft75.innerHTML = '';
    this.labels.topLeft75.appendChild(topLeft75Content);
    this.applyLabelStyles(this.labels.topLeft75); // Call the method with 'this'

    const rightTop25Content = createFormattedDegreeLabel(`${rightLon25.toFixed(2)}°E`);
    this.labels.rightTop25.innerHTML = '';
    this.labels.rightTop25.appendChild(rightTop25Content);
    this.applyLabelStyles(this.labels.rightTop25); // Call the method with 'this'

    const rightTop75Content = createFormattedDegreeLabel(`${rightLon75.toFixed(2)}°E`);
    this.labels.rightTop75.innerHTML = '';
    this.labels.rightTop75.appendChild(rightTop75Content);
    this.applyLabelStyles(this.labels.rightTop75); // Call the method with 'this'

    // Position the labels
    this.positionLabel(this.labels.topLeft25, 'top', '25%');
    this.positionLabel(this.labels.topLeft75, 'top', '75%');
    this.positionLabel(this.labels.rightTop25, 'right', '25%');
    this.positionLabel(this.labels.rightTop75, 'right', '75%');
  }

}
