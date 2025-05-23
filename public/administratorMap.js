let map, infoWindow;
let AdvancedMarkerElement, PinElement;
let Map;
//let AdvancedMarkerElement;
import { fetchUserData, fetchUserTok } from '../utils/api.js'; 


let dataOutput = document.getElementById("data");
let currLocationMarker;
//const apiKey = process.env.GOOGLE_API_KEY;

//gets user token and then gets the full user object from here
const curr_user_tok = await fetchUserTok();
const curr_user = await fetchUserData(curr_user_tok.user_uid);



async function initMap() {
    console.log("initializing map...");
  // The location of Uluru
  
  // Request needed libraries.
  //@ts-ignore
  try {
    const mapLibrary = await google.maps.importLibrary("maps");
    const markerLibrary = await google.maps.importLibrary("marker");
    Map = mapLibrary.Map;
    AdvancedMarkerElement = markerLibrary.AdvancedMarkerElement;
    PinElement = markerLibrary.PinElement;

    if (!Map || !AdvancedMarkerElement || !PinElement) { 
        throw new Error("couldnt import google maps classes")
    }
  } catch (err) {
    throw new Error("couldn't import google maps libraries");
  }

   const school_uid = curr_user.school_uid;
   const result = await fetch(`/getSchoolCoordinates`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ school_uid })
   });
   const schoolCoordinates = await result.json();
   
   const schoolLatitude = schoolCoordinates.st_y;
   const schoolLongitude = schoolCoordinates.st_x;
   const position = { lat: schoolLatitude, lng: schoolLongitude };

   



  // The map, centered at Uluru
  const mapElement = document.getElementById("map");
  if(!mapElement) {
    console.error("Map element not found");
    return;
  }
  map = new Map(mapElement, {
    zoom: 15,
    center: position,
    mapId: "DEMO_MAP_ID",
  });
  infoWindow = new google.maps.InfoWindow();

  // The marker, positioned at Uluru
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "School Location",
  });

    console.log("Map initialized. Mapping users...");
    await mapUsers();
}




console.log("Window loaded. Starting mapping...");
initMap();
 




async function mapUsers() {
    try {
        const response = await fetch('/getUsersandLocations');
        const geolocations = await response.json();
        const userList = document.getElementById("user-list");   
        const promises = geolocations.map(async geo => {
            if (geo) {
                console.log("creating element...");
                const date = new Date(geo.timestamp);
                const formattedDate = date.toISOString().split('T')[0];
                const li = document.createElement('li');
                li.className = "list-group-item";
                li.textContent = `${geo.username} - Status: ${geo.status}\n${geo.name}\n${formattedDate}`;
        
                if (geo.status === 'Safe') {
                    li.style.color = 'green';
                } else if (geo.status === 'In Danger') {
                    li.style.color = 'red';
                } else {
                    li.style.color = 'orange';
                }
                
                li.dataset.userId = geo.location_uid;
                li.style.cursor = 'pointer';
        
                li.addEventListener('click', () => {
                    const this_marker = markers[geo.student_uid].marker;
                    map.panTo(this_marker.position);
                    map.setZoom(17);
        
                    if (currentInfoWindow) {
                        currentInfoWindow.close();
                    }
                    markers[geo.student_uid].infoWindow.open(map, this_marker);
                    currentInfoWindow = markers[geo.student_uid].infoWindow;
                });
                
                await mapGeomLoc(geo);
                userList.appendChild(li);
            }
        });
        
        // Wait for all promises to complete
        await Promise.all(promises);
    } catch(err) {
        console.error("Couldn't map users: " + err);
    }
    
}

const markers = {};

async function mapGeomLoc(geo) {
    const markerLibrary = await google.maps.importLibrary("marker");
    PinElement = markerLibrary.PinElement;
    
    const geom = geo.location_uid;
    const geoPos = await fetch ('/getLocationCoordinates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ geom })
    });
    const foundGeo = await geoPos.json();
    const geoLatitude = foundGeo.rows[0].st_y;
    const geoLongitude = foundGeo.rows[0].st_x;
    const position = { lat: geoLatitude, lng: geoLongitude };



    
    const pinBackground = {
        background: geo.status === 'Safe' ? "#1fa012" : "#e61f27",
        scale: 1.5,
        glyphColor: geo.status === 'Safe' ? "white" : undefined, // Only set glyphColor if status is 'Safe'
        borderColor: geo.status === 'Safe' ? "white" : undefined // Only set borderColor if status is 'Safe'
    };
    
    const pin = new PinElement(pinBackground);

    
    
    const currLocationMarker = new AdvancedMarkerElement({
        map: map,
        position: position,
        title: "Current Location",
        content: pin.element,
        gmpClickable: true
      });

    

    
    const currLocationMarkerIW = new google.maps.InfoWindow({
        content: `Student Info: Name: ${geo.name}, Phone: ${geo.phone_number}, Email: ${geo.email}`
    });
    
    markers[geo.student_uid] = {
        marker: currLocationMarker,
        infoWindow: currLocationMarkerIW
    };
    

      currLocationMarker.addListener("click", ()=> {
        if (currentInfoWindow) {
            currentInfoWindow.close();
        }
        currLocationMarkerIW.open(map, currLocationMarker);
        currentInfoWindow = currLocationMarkerIW;
      });

      pin.element.style.cursor = 'pointer';

      pin.element.addEventListener('mouseenter', () => {
        pin.element.style.transform = 'scale(1.1)'; // Scale up on hover
    });
    
    pin.element.addEventListener('mouseleave', () => {
        pin.element.style.transform = 'scale(1)'; // Scale back down
    });
}

let currentInfoWindow = null;

/*
function getGeocodeURL(address) {
    const encodedAddress = encodeURIComponent(address);
    const apiKey = process.env.GOOGLE_API_KEY;
    return `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
}

*/


const directions = Object.freeze({
    North: 0,
    East: 1,
    South: 2,
    West: 3
});

function isValidPosition(position) {
    return typeof position === 'object' &&
            position != null &&
            (typeof position.lat === 'number' && 
                position.lat >= -90 &&
                position.lat <= 90 ) &&
            (typeof position.lng ==='number' &&
                position.lng >= -90 && 
                position.lng <= 90 );    
};


function isValidDirection(direction) {
    return typeof direction === 'number' && 
            Object.values(directions).includes(direction);
}

function convertToKM(offset) {
    return offset / 1000;
}

//offset in km
function calculateCoordinateChange(currentPosition, direction, offsetKM) {
    if(!isValidPosition(curentPosition)) {
        throw new Error('Invalid currentPosition');
    }
    if(!isValidDirection(direction)) {
        throw new Error('Invalid direction');
    }
    if(typeof offset !== 'number' || offset < 0) {
        throw new Error('Invalid offset');
    }

    let latitude = currentPosition.lat;
    let longitude = currentPosition.lng;
    let newCoordinatePosition = {
        lat: 0,
        lng: 0
    };
    if(direction == directions.North) {
        newCoordinatePosition.lat = currentPosition.lat;
        newCoordinatePosition.lng = currentPosition.lng + (offset / (111.320 * Math.cos(newCoordinatePosition.lat)));

    } else if(direction == directions.South) {
        newCoordinatePosition.lat = currentPosition.lat;
        newCoordinatePosition.lng = currentPosition.lng - (offset / (111.320 * Math.cos(newCoordinatePosition.lat)));
    } else if(direction == directions.East) {
        newCoordinatePosition.lng = currentPosition.lng;
        newCoordinatePosition.lat = currentPosition.lat + (offsetKM / 110.574);

    } else if(direction == directions.West) {
        newCoordinatePosition.lng = currentPosition.lng;
        newCoordinatePosition.lat = currentPosition.lat - (offsetKM / 110.574);
    }
    return newCoordinatePosition;
}