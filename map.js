const map = L.map("map").setView(
    [28.1,30.75],
    15
);

/* --------------------------
   Map Layer
---------------------------*/

L.tileLayer(

    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    {

        attribution:
            "&copy; OpenStreetMap"

    }

).addTo(map);

/* --------------------------
   Icons
---------------------------*/

const userIcon = L.icon({

    iconUrl:
        "https://cdn-icons-png.flaticon.com/512/447/447031.png",

    iconSize:[40,40],

    iconAnchor:[20,20]

});

const targetIcon = L.icon({

    iconUrl:
        "https://cdn-icons-png.flaticon.com/512/684/684908.png",

    iconSize:[42,42],

    iconAnchor:[21,42]

});

/* --------------------------
   Update Map
---------------------------*/

function updateMap(
    lat,
    lng
){

    /* User Marker */

    if(!userMarker){

        userMarker = L.marker(

            [lat,lng],

            {
                icon:userIcon
            }

        ).addTo(map);

    }else{

        userMarker.setLatLng(
            [lat,lng]
        );

    }

    /* Target Marker */

    if(
        targetLat !== null &&
        targetLng !== null
    ){

        if(!targetMarker){

            targetMarker = L.marker(

                [targetLat,targetLng],

                {
                    icon:targetIcon
                }

            ).addTo(map);

        }else{

            targetMarker.setLatLng(

                [
                    targetLat,
                    targetLng
                ]

            );

        }

    }

    /* Navigation Line */

    if(linePath){

        map.removeLayer(
            linePath
        );

    }

    if(
        targetLat !== null &&
        targetLng !== null
    ){

        linePath = L.polyline(

            [

                [lat,lng],

                [
                    targetLat,
                    targetLng
                ]

            ],

            {

                color:"#00d9ff",

                weight:4,

                opacity:0.8,

                dashArray:"10,10"

            }

        ).addTo(map);

    }

    /* Auto Center */

    map.setView(
        [lat,lng],
        19,
        {
            animate:true,
            duration:1
        }
    );

}