const coordType = document.getElementById("coordType");

const wgs84Box = document.getElementById("wgs84Box");
const dmsBox = document.getElementById("dmsBox");
const utmBox = document.getElementById("utmBox");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const centerBtn = document.getElementById("centerBtn");
const clearBtn = document.getElementById("clearBtn");

const distanceText = document.getElementById("distanceText");
const statusText = document.getElementById("statusText");
const gpsAccuracy = document.getElementById("gpsAccuracy");

const beepSound = document.getElementById("beepSound");
const nearSound = document.getElementById("nearSound");
const arrivedSound = document.getElementById("arrivedSound");

let targetLat = null;
let targetLng = null;

let watchId = null;

let userMarker = null;
let targetMarker = null;
let linePath = null;

let arrived = false;

/* --------------------------
   Coordinate Type Switch
---------------------------*/

coordType.addEventListener("change", () => {

    wgs84Box.classList.add("hidden");
    dmsBox.classList.add("hidden");
    utmBox.classList.add("hidden");

    if(coordType.value === "wgs84"){

        wgs84Box.classList.remove("hidden");

    }

    if(coordType.value === "dms"){

        dmsBox.classList.remove("hidden");

    }

    if(coordType.value === "utm"){

        utmBox.classList.remove("hidden");

    }

});

/* --------------------------
   Start Navigation
---------------------------*/

startBtn.addEventListener("click", () => {

    arrived = false;

    getTargetCoordinates();

    if(targetLat === null || targetLng === null){

        alert(
            "Please Enter Valid Coordinates"
        );

        return;

    }

    startGPS();

});

/* --------------------------
   Stop Navigation
---------------------------*/

stopBtn.addEventListener("click", () => {

    if(watchId !== null){

        navigator.geolocation.clearWatch(
            watchId
        );

        watchId = null;

        statusText.innerText = "STOPPED";

    }

});

/* --------------------------
   Center Map
---------------------------*/

centerBtn.addEventListener("click", () => {

    if(currentLat && currentLng){

        map.setView(
            [currentLat,currentLng],
            19
        );

    }

});

/* --------------------------
   Clear Coordinates
---------------------------*/

clearBtn.addEventListener("click", () => {

    /* WGS84 */

    document.getElementById(
        "latitude"
    ).value = "";

    document.getElementById(
        "longitude"
    ).value = "";

    /* DMS */

    document.getElementById(
        "nDeg"
    ).value = "";

    document.getElementById(
        "nMin"
    ).value = "";

    document.getElementById(
        "nSec"
    ).value = "";

    document.getElementById(
        "eDeg"
    ).value = "";

    document.getElementById(
        "eMin"
    ).value = "";

    document.getElementById(
        "eSec"
    ).value = "";

    /* UTM */

    document.getElementById(
        "easting"
    ).value = "";

    document.getElementById(
        "northing"
    ).value = "";

    /* Reset Values */

    targetLat = null;
    targetLng = null;

    distanceText.innerText = "--";

    statusText.innerText = "WAITING";

    document.body.style.background =
        "#061018";

    /* Remove Map Objects */

    if(userMarker){

        map.removeLayer(userMarker);

    }

    if(targetMarker){

        map.removeLayer(targetMarker);

    }

    if(linePath){

        map.removeLayer(linePath);

    }

});

/* --------------------------
   Get Coordinates
---------------------------*/

function getTargetCoordinates(){

    /* WGS84 */

    if(coordType.value === "wgs84"){

        targetLat = parseFloat(
            document.getElementById(
                "latitude"
            ).value
        );

        targetLng = parseFloat(
            document.getElementById(
                "longitude"
            ).value
        );

    }

    /* DMS */

    if(coordType.value === "dms"){

        let nDeg = parseFloat(
            document.getElementById(
                "nDeg"
            ).value
        ) || 0;

        let nMin = parseFloat(
            document.getElementById(
                "nMin"
            ).value
        ) || 0;

        let nSec = parseFloat(
            document.getElementById(
                "nSec"
            ).value
        ) || 0;

        let eDeg = parseFloat(
            document.getElementById(
                "eDeg"
            ).value
        ) || 0;

        let eMin = parseFloat(
            document.getElementById(
                "eMin"
            ).value
        ) || 0;

        let eSec = parseFloat(
            document.getElementById(
                "eSec"
            ).value
        ) || 0;

        targetLat =
            nDeg +
            (nMin / 60) +
            (nSec / 3600);

        targetLng =
            eDeg +
            (eMin / 60) +
            (eSec / 3600);

    }

    /* UTM */

    if(coordType.value === "utm"){

        const easting = parseFloat(
            document.getElementById(
                "easting"
            ).value
        );

        const northing = parseFloat(
            document.getElementById(
                "northing"
            ).value
        );

        const converted = utmToLatLng(
            easting,
            northing
        );

        targetLat = converted.lat;

        targetLng = converted.lng;

    }

}

/* --------------------------
   Distance Formula
---------------------------*/

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
){

    const R = 6371000;

    const dLat =
        (lat2-lat1) *
        Math.PI/180;

    const dLon =
        (lon2-lon1) *
        Math.PI/180;

    const a =

        Math.sin(dLat/2) *
        Math.sin(dLat/2) +

        Math.cos(lat1*Math.PI/180) *

        Math.cos(lat2*Math.PI/180) *

        Math.sin(dLon/2) *

        Math.sin(dLon/2);

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1-a)
    );

    return R * c;

}

/* --------------------------
   Navigation Update
---------------------------*/

function updateNavigation(
    userLat,
    userLng
){

    const distance =
        calculateDistance(

            userLat,
            userLng,

            targetLat,
            targetLng

        );

    /* Distance */

    if(distance > 1000){

        distanceText.innerText =
            (distance/1000).toFixed(2)
            + " km";

    }else{

        distanceText.innerText =
            distance.toFixed(1)
            + " m";

    }

    /* Status */

    if(distance > 50){

        statusText.innerText = "FAR";

        document.body.style.background =
            "#061018";

    }

    if(distance <= 50 && distance > 15){

        statusText.innerText = "NEAR";

        document.body.style.background =
            "#2b1d00";

        playBeep();

    }

    if(distance <= 15 && distance > 5){

        statusText.innerText =
            "VERY CLOSE";

        document.body.style.background =
            "#3a3200";

        playNear();

    }

    if(distance <= 5 && !arrived){

        arrived = true;

        statusText.innerText =
            "ARRIVED";

        document.body.style.background =
            "#002b12";

        playArrived();

        speak(
            "You reached destination"
        );

        if(navigator.vibrate){

            navigator.vibrate([
                300,
                100,
                300
            ]);

        }

    }

}

/* --------------------------
   Sounds
---------------------------*/

function playBeep(){

    beepSound.currentTime = 0;

    beepSound.play();

}

function playNear(){

    nearSound.currentTime = 0;

    nearSound.play();

}

function playArrived(){

    arrivedSound.currentTime = 0;

    arrivedSound.play();

}