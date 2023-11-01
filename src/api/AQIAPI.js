// AQIAPI.js
export const fetchAQIData = (bounds) => {
    return fetch(`https://api.waqi.info/v2/map/bounds/?latlng=${bounds}&token=a4edd269449c2a5c4b8a549c4e2fc789d509c4aa`)
        .then(response => response.json());
}

export const getAQIMarkerPopup = (markerUID) => {
    return fetch(`https://api.waqi.info/feed/@${markerUID}/?token=a4edd269449c2a5c4b8a549c4e2fc789d509c4aa`)
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'ok') throw new Error(data.data);

            const marker = data.data;
            let info = `${marker.city.name}: AQI ${marker.aqi} updated on ${new Date(marker.time.v * 1000).toLocaleTimeString()}<br>`;
            if (marker.city.location) info += `<b>Location</b>: <small>${marker.city.location}</small><br>`;

            const pollutants = ["pm25", "pm10", "o3", "no2", "so2", "co"];
            info += "<b>Pollutants</b>: ";
            for (let specie in marker.iaqi) {
                if (pollutants.indexOf(specie) >= 0) info += `<u>${specie}</u>:${marker.iaqi[specie].v} `;
            }
            info += "<br>";
            return info;
        });
}
