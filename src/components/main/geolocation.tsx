import React, { useState, useEffect } from 'react';
import { MdOutlineMyLocation } from "react-icons/md";

interface Position {
    latitude: number;
    longitude: number;
}

const Geolocation: React.FC = () => {
    const [isEnabled, setIsEnabled] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('Checking for geolocation support...');

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.permissions.query({ name: "geolocation" }).then((result) => {
                if (result.state === "granted" || result.state === "prompt") {
                    setIsEnabled(true);
                    setMessage("Click to get location");
                } else if (result.state === "denied") {
                    setIsEnabled(false);
                    setMessage("Geolocation access denied. Please enable it in your browser settings.");
                }

                // Listen for changes in permission
                result.onchange = () => {
                    if (result.state === "granted") {
                        setIsEnabled(true);
                        setMessage("Click to get location");
                    } else {
                        setIsEnabled(false);
                        setMessage("Geolocation access denied. Please enable it in your browser settings.");
                    }
                };
            });
        } else {
            setIsEnabled(false);
            setMessage("Geolocation is not supported by your browser.");
        }
    }, []);

    const getLocation = (): void => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        }
    };

    const showPosition = (position: GeolocationPosition): void => {
        const { latitude, longitude } = position.coords;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        setMessage(`Latitude: ${latitude}, Longitude: ${longitude}`);
    };

    const showError = (error: GeolocationPositionError): void => {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                setMessage("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                setMessage("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                setMessage("The request to get user location timed out.");
                break;
            // case error.UNKNOWN_ERROR:
            //     setMessage("An unknown error occurred.");
            //     break;
        }
        setIsEnabled(true); // Allow the user to retry
    };

    return (
        
            <button onClick={getLocation}  > <MdOutlineMyLocation color='green'  size={24}/></button>
     
    );
};

export default Geolocation;
