// SensorCommunityAPI.js
export const fetchSensorCommunityData = (latitude_center, longitude_center, delta) => {
    return fetch('https://data.sensor.community/static/v1/data.json')
        .then(response => response.json())
        .then(data => {
            return data.filter(measurement => (
                (latitude_center - delta) <= measurement.location.latitude && measurement.location.latitude <= (latitude_center + delta)
                &&
                (longitude_center - delta) <= measurement.location.longitude && measurement.location.longitude <= (longitude_center + delta)
            ));
        });
}

export const getSensorMarkerIconUrl = (pm10) => {
    if (pm10 <= 1) return 'https://waqi.info/mapicon/10.30.png';
    if (pm10 <= 5) return 'https://waqi.info/mapicon/30.30.png';
    if (pm10 <= 10) return 'https://waqi.info/mapicon/60.30.png';
    return 'https://waqi.info/mapicon/100.30.png';
}
