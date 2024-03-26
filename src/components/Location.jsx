import React, { useState, useEffect } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
function LocationDisplay({ onLocationUpdate }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isLoaded) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const name = data.results[0].formatted_address;
              setLocationName(name);
              onLocationUpdate(name); 
            } else {
              setError("Location data not found");
            }
          } catch (error) {
            console.error("Error fetching location data:", error);
            setError("Error fetching location data");
          } finally {
            setLoading(false); 
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Error getting user's location");
          setLoading(false);
        }
      );
    }
  }, [isLoaded, onLocationUpdate]);

  if (loadError) return <div>Error loading Google Maps API</div>;
  if (loading) return <div>Loading location...</div>;
  if (error) return <div>{error}</div>;

  return <div className="location">📍 {locationName}</div>;
}

export default LocationDisplay;
