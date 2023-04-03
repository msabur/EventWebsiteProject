/**
 * Get location name from latitude and longitude
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<string>} - Location name
 */
export async function getLocationName(lat, lon) {
    let countryName = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&address_details=0`)
        .then(response => response.json())
        .then(data => {
            return data.address.country;
        })

    return countryName;
}
