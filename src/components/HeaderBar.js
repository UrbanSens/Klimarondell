import React from 'react';
import './HeaderBar.css';

const HeaderBar = () => {
    return (
        <div className="header-bar">
            <img src="/logo02.png" alt="Company Logo" className="logo" />
            <nav className="navigation">
                <a href="#" className="nav-link">Home</a>
                <a href="#" className="nav-link">Map</a>
                <a href="#" className="nav-link">Statistics</a>
            </nav>
        </div>
    );
}

export default HeaderBar;
