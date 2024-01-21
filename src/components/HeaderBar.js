import React from 'react';
import './HeaderBar.css';
import '../Map/MapComponentDarkmode.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faFileInvoice } from "@fortawesome/free-solid-svg-icons";


// Define a style object for the icons
const iconStyle = {
    color: 'grey',
    fontSize: '2em' // 'em' is relative to the current font size
};

const HeaderBar = (props) => {
    // Destructure the darkMode prop
    const { darkMode } = props;

    return (
        <div className={`header-bar ${darkMode ? 'dark-mode' : ''}`}>
            <img src="/logo02.png" alt="Company Logo" className="logo" />
            <nav className="navigation">
                <FontAwesomeIcon icon={faFileInvoice} className="icon" style={iconStyle} /> {/* Added className */}
                <FontAwesomeIcon icon={faFacebook} className="icon" style={iconStyle} /> {/* Added className */}
                <FontAwesomeIcon icon={faLinkedin} className="icon" style={iconStyle} /> {/* Added className */}
            </nav>
        </div>
    );
}

export default HeaderBar;
