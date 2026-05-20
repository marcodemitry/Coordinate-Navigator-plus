let currentLat = null;
let currentLng = null;

let lastLat = null;
let lastLng = null;

let currentHeading = 0;

let smoothedHeading = 0;

let compassHeading = 0;

/* --------------------------
   Start GPS
---------------------------*/

function startGPS(){

    if(!navigator.geolocation){

        alert(
            "GPS Not Supported"
        );

        return;

    }

    watchId =
        navigator.geolocation.watchPosition(

            position => {

                currentLat =
                    position.coords.latitude;

                currentLng =
                    position.coords.longitude;

                const accuracy =
                    position.coords.accuracy;

                gpsAccuracy.innerText =
                    "GPS Accuracy: ±"
                    + accuracy.toFixed(1)
                    + " m";

                /* Real Movement Heading */

                if(
                    lastLat !== null &&
                    lastLng !== null
                ){

                    currentHeading =
                        calculateBearing(

                            lastLat,
                            lastLng,

                            currentLat,
                            currentLng

                        );

                }

                lastLat = currentLat;
                lastLng = currentLng;

                updateMap(
                    currentLat,
                    currentLng
                );

                updateNavigation(
                    currentLat,
                    currentLng
                );

                rotateCompass();

                voiceDirection(
                    smoothedHeading
                );

            },

            error => {

                alert(
                    "GPS Error"
                );

                console.log(error);

            },

            {

                enableHighAccuracy:true,

                maximumAge:0,

                timeout:15000

            }

        );

}

/* --------------------------
   Compass Sensor
---------------------------*/

window.addEventListener(

    "deviceorientationabsolute",

    event => {

        if(event.alpha !== null){

            compassHeading =
                360 - event.alpha;

        }

    },

    true

);

/* --------------------------
   Rotate Compass
---------------------------*/

function rotateCompass(){

    if(
        targetLat === null ||
        targetLng === null
    ){
        return;
    }

    const targetBearing =
        calculateBearing(

            currentLat,
            currentLng,

            targetLat,
            targetLng

        );

    /* Combined Direction */

    let finalHeading =
        targetBearing -
        currentHeading;

    /* Normalize */

    if(finalHeading > 180){

        finalHeading -= 360;

    }

    if(finalHeading < -180){

        finalHeading += 360;

    }

    /* Smooth Rotation */

    smoothedHeading +=
        (finalHeading - smoothedHeading)
        * 0.15;

    document.getElementById(
        "compassArrow"
    ).style.transform =

        `rotate(${smoothedHeading}deg)`;

}

/* --------------------------
   Bearing Formula
---------------------------*/

function calculateBearing(
    lat1,
    lon1,
    lat2,
    lon2
){

    const dLon =
        (lon2-lon1)
        * Math.PI/180;

    lat1 =
        lat1 * Math.PI/180;

    lat2 =
        lat2 * Math.PI/180;

    const y =
        Math.sin(dLon)
        * Math.cos(lat2);

    const x =

        Math.cos(lat1)
        * Math.sin(lat2)

        -

        Math.sin(lat1)
        * Math.cos(lat2)
        * Math.cos(dLon);

    let bearing =
        Math.atan2(y,x)
        * 180/Math.PI;

    bearing =
        (bearing + 360) % 360;

    return bearing;

}