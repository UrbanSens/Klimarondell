import React from 'react';
import Map from './Map/Map';
import HeaderBar from './components/HeaderBar';

class App extends React.Component {
    render() {
        return (
            <div>
                <HeaderBar />
                <Map />
            </div>
        );
    }
}

export default App;
