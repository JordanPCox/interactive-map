// Create map
const myMap = {
    coordinates: [],
    businesses: [],
    map: {},
    markers: [], // Change to an array to store markers

    buildMap() {
        this.map = L.map('map', {
            center: this.coordinates,
            zoom: 16,
        })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            minZoom: '8',
        }).addTo(this.map);

        const marker = L.marker(this.coordinates);
        marker
            .addTo(this.map)
            .bindPopup('<p1><b>You are here</b><br></p1>')
            .openPopup();

        this.addMarkers();
    },

    // Add business markers with functionality that removes existing markers when a new/different selection is made.
    addMarkers() {
        // Remove existing markers
        this.markers.forEach(marker => {
            marker.remove();
        });

        // Add new markers
        this.markers = this.businesses.map(business => {
            return L.marker([business.lat, business.long])
                .bindPopup(`<p1>${business.name}</p1>`)
                .addTo(this.map);
        });
    },
};

// Pull user coordinates
async function getCoords() {
    const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return [pos.coords.latitude, pos.coords.longitude];
}

async function initializeMap() {
    const coords = await getCoords();
    myMap.coordinates = coords;
    myMap.buildMap();
}

// Adding in Foursquare to get business info
async function pullFourSquare(business) {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'fsq3NbNKDqr7zj+fXpptY94NY5/qaPm5a4DT3t+yP/u3yxU=',
        },
    };

    let limit = 8;
    let lat = myMap.coordinates[0];
    let lon = myMap.coordinates[1];
    let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${lon}`, options);
    let data = await response.text();
    let parsedData = JSON.parse(data)
    let businesses = parsedData.results;
    return businesses;
}

function processBusinesses(data) {
    let businesses = data.map((element) => {
        let location = {
            name: element.name,
            lat: element.geocodes.main.latitude,
            long: element.geocodes.main.longitude
        }
        return location
    })
    return businesses
}

// Submit button functionality
document.getElementById('submit').addEventListener('click', async (event) => {
    event.preventDefault()
    let business = document.getElementById('menu').value
    let data = await pullFourSquare(business)
    myMap.businesses = processBusinesses(data)
    myMap.addMarkers()
})

//Handle window load sequence
document.addEventListener('DOMContentLoaded', initializeMap);




//Ideas / Attempts

//--BUTTON FOR GEOLOCATION
// const button = document.querySelector("button");

// button.addEventListener("click", () => {
//     navigator.geolocation.getCurrentPosition(position => {
//         const { latitude, longitude } = position.coords;
//         const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
//         fetch(url).then(res => res.json()).then(data => {console.table(data.address);
//         }).catch(() => {
//             console.log("Error fetching data from API");
//         });
//     });
// });
//--END BUTTON FOR GEOLOCATION


//--This marker is dropping a pin on London, pulled from other activity and left here for reference.
// let marker = L.marker([51.5, -0.09]).addTo(map);
//--END MARKER REFERENCE



// --Function to get time of day in case we want time-specific suggestions from FourSquare API
// function userTime(){
//     const now = new Date()
//     return now.getHours()
// }

// function getUserTime(){
//     const tod = userTime()

//     if (tod > 20) {return 'late night options'}
//     else if (tod > 16) {return 'dinner'}
//     else if (tod > 11) {return 'lunch'}
//     else {return 'breakfast'}
// }
//--END TIME FUNCTION