import React from 'react';
import MapComponent from './Map/MapComponent';
import HeaderBar from './components/HeaderBar';
import './index.css'; // Make sure to import the CSS file if it's not already imported elsewhere

class App extends React.Component {
    render() {
        return (
            <div className="app-container"> {/* Add a class name here */}
                <HeaderBar />
                <MapComponent />
            </div>
        );
    }
}

export default App;
