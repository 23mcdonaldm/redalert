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
        console.log("finding location");
        findMyCoordinates();
    
    });

}


}




console.log("Window loaded. Starting mapping...");
initMap();
mapUsers();  


async function mapUsers() {
    console.log("mapping users...");
    try {
        const response = await fetch('/getUserList');
        console.log("responses found: ");
        console.log(response);
        const geolocations = await response.json();
        console.log("geolocations found:")
        console.log(geolocations);
        console.log("Rows logging... "); 
        const userList = document.getElementById("user-list");   
        geolocations.forEach(geo => {
            const li = document.createElement('li');
            li.className = "list-group-item";
            li.textContent = geo.student_uid;
            li.dataset.userId = geo.location_uid;
            userList.appendChild(li);
        })
    } catch(err) {
        console.error("Couldn't map users: " + err);
    }
    
    
}



/*
currLocationMarker.addEventListener("click", ({ domEvent, latLng }) => {
    const { target } = domEvent;

    infoWindow.close();
    infoWindow.setContent(marker.title);
    infoWindow.open(marker.map, marker);
});
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


/*
function generateGrid(centerPosition, numBlocks) {

}

/*
const user_pos = {
    lat: 33.88384,
    lng: 118.39161
};

const new_pos = calculateCoordinateChange(user_pos, directions.West, 1.02);
console.log(new_pos.lat);
console.log(new_pos.lng);

*/