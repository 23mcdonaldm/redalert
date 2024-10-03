




function getGeocodeURL(address) {
    const encodedAddress = encodeURIComponent(address);
    const apiKey = process.env.GOOGLE_API_KEY;
    return `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
}


