let map, infoWindow;
let Map;
let AdvancedMarkerElement;
let PinElement;

let dataOutput = document.getElementById("data");
let currLocationMarker;

//getting userData for backend
async function fetchUserTok() {
    try {
        const response = await fetch('/getUserTok');

        if(!response.ok) {
            throw new Error('Error getting user cookie data');
        }
        const data = await response.json();
        console.log('User data: ', data);

        return data;
    } catch (err) {
        console.error('Failed to fetch data');
        return null;
    }
}

async function fetchUserData(user_uid) {
    try {
        const response = await fetch(`/fetchUserData/${user_uid}`);
        if(!response.ok) {
            throw new Error('Error getting user details');
        }
        const user = await response.json();
        return user;
    } catch (err) {
        console.error('Failed to fetch user details', err);
        return null;
    }
}
//gets user token and then gets the full user object from here
const curr_user_tok = await fetchUserTok();
const curr_user = await fetchUserData(curr_user_tok.user_uid);



async function initMap() {
  // The location of Uluru
  const position = { lat: 0, lng: 0 };
  // Request needed libraries.
  //@ts-ignore
  try {
    ({ Map } = await google.maps.importLibrary("maps"));
    ({ AdvancedMarkerElement } = await google.maps.importLibrary("marker"));
    ({ PinElement } = await google.maps.importLibrary("marker"));
  } catch (err) {
    throw new Error("couldn't import google maps libraries");
  }
    


  // The map, centered at Uluru
  map = new Map(document.getElementById("map"), {
    zoom: 4,
    center: position,
    mapId: "DEMO_MAP_ID",
  });
  infoWindow = new google.maps.InfoWindow();

  // The marker, positioned at Uluru
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Uluru",
  });

  
  
  if(curr_user.user_type == 'student') {

  
  const locationButton = document.createElement("button");

  locationButton.textContent = "Mark My Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

    locationButton.addEventListener("click", () => {
        console.log("finding status");
        const statusForm = document.getElementById('status-form');
        let status = statusForm.querySelector('input[name="status"]:checked');
        if(!status) {
            status = 'Safe';
        } else {
            status = status.value;
        }
        console.log("status: " + status);
        console.log("finding location");
        
        findMyCoordinates(status);
    
    });

}


}

initMap();


function findMyCoordinates(status) {
    
    if(navigator.geolocation) {
        console.log("location found");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log(pos);
                try {
                    const curr_latitude = pos.lat;
                    const curr_longitude = pos.lng;
                    const posInput = 'Point(' + curr_longitude + ' ' + curr_latitude + ')';
                    console.log('starting with ' + posInput);
                    console.log("status: " + status);
                    const response = await fetch('/mapUserCoordinates', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            posInput,
                            curr_user,
                            status
                        }),
                    });
                } catch (err) {
                    console.error('Error sending location data:', err);
                }
                
                dataOutput.innerText = `User Location Data\n{\nLatitude: ${pos.lat}\nLongitude: ${pos.lng}\n}`;
                //infoWindow.setPosition(pos);
                //infoWindow.open(map);
                map.setCenter(pos);
                map.setZoom(15);
                
                const userLocationPin = new PinElement({
                    scale: 1.5
                });

                currLocationMarker = new AdvancedMarkerElement({
                    map: map,
                    position: pos,
                    title: "Current Location",
                    content: userLocationPin.element,
                    gmpClickable: true
                  });

                  const currLocationMarkerIW = new google.maps.InfoWindow({
                    content: "Current Location!"
                  });

                  currLocationMarker.addListener("click", ()=> {
                    currLocationMarkerIW.open(map, currLocationMarker);
                  });
                
            },
            (err) => {
                alert(err.message);
            })
        
    } else {
        alert("Geolocation is not supported by your browser");
    }
}

function mapUsers() {
    const userList = userList();
}

async function userList() {
    try {
        const insertQuery = `SELECT * FROM geolocation`;
        const result = await pool.query(insertQuery);
        result.rows.forEach(row => {
            console.log(row);
        })
    } catch(err) {
        console.error("Error fetching user list: " + err);
    }

}



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
