import mapboxgl from 'mapbox-gl';
import nearestPoint from '@turf/nearest-point'
import {
    point,
    featureCollection
} from '@turf/helpers'
import 'bootstrap';
import './style.scss'
// mapbox-gl layer styles
import {
    greggs_points,
    greggs_heat,
    pret_points,
    pret_heat
} from './layers.js';

import jQuery from 'jquery';
var $ = jQuery;

const options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

mapboxgl.accessToken = 'pk.eyJ1IjoidXJzY2hyZWkiLCJhIjoiY2pubHJsaGZjMWl1dzNrbzM3eDBuNzN3eiJ9.5xEWTiavcSRbv7LYZoAmUg';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    zoom: 5.205985389161131,
    center: {
        lng: -3.8,
        lat: 53.82777852234969
    },
    customAttribution: 'Uses <a href="https://ratings.food.gov.uk">FHRS</a> Data'
});

// This will hold our FeatureCollections for use with Turf after the map loads
var gdata = {};
var active_chain = 'greggs';

const dataSources = {
    "greggs": {
        "url": "static/latest_greggs.geojson",
        "p_layer": greggs_points,
        "h_layer": greggs_heat
    },
    "pret": {
        "url": "static/latest_pret.geojson",
        "p_layer": pret_points,
        "h_layer": pret_heat
    }
};

// Add GeoJSON layers to map, and make them available to turf
async function getBranches(m) {
    var promises = [];
    promises.push(
        Object.keys(dataSources).forEach(function(item) {
            fetch(dataSources[item]["url"])
                .then(response => response.json())
                .then(data => {
                    m.addSource(item, {
                            "type": "geojson",
                            "data": data
                        })
                        .addLayer(dataSources[item]["p_layer"])
                        .addLayer(dataSources[item]["h_layer"], "waterway-label");
                    // Assign our FeatureCollection to an empty global variable so we can use it elsewhere
                    gdata[item] = featureCollection(data['features']);
                })
        })
    );
    await Promise.all(promises);
}

map.on('load', function() {
    getBranches(this);
    if ("geolocation" in navigator) {
        // do nothing
    } else {
        $('#locate').fadeOut(500);
    }
});

['greggs', 'pret'].forEach(function(chain) {
    // When a click event occurs on a feature in the point layer, open a popup at the
    // location of the feature, with post code and authority text from its properties.
    map.on('click', chain + '_points', function(e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        const theDate = new Date(e.features[0].properties.RatingDate);
        const humanDate = theDate.toLocaleDateString('en-GB', options);
        var description = `<p>Post Code: ${e.features[0].properties.PostCode} in ${e.features[0].properties.LocalAuthorityName}</p><p>FHRS Rating: ${e.features[0].properties.RatingValue}</p><p>Rating Date: ${humanDate}</p>`;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        const popupContent = `
          <div class="card border border-dark bg-primary-subtle m-2">
            <div class="card-body">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item"><strong>Address:</strong> ${e.features[0].properties.PostCode} in ${e.features[0].properties.LocalAuthorityName}</li>
                    <li class="list-group-item"><strong>FHRS Rating:</strong> ${e.features[0].properties.RatingValue}</li>
                    <li class="list-group-item"><strong>Rating Date:</strong> ${humanDate}</li>
                </ul>
            </div>
          </div>
        `;
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer
    map.on('mouseenter', chain + '_points', function() {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves
    map.on('mouseleave', chain + '_points', function() {
        map.getCanvas().style.cursor = '';
    });
})

$("#lookup").submit(function(event) {
    event.preventDefault();
    var pc = $("input").first().val();
    $("input").first().val("");
    $.getJSON("https://api.postcodes.io/postcodes/" + pc)
        .done(function(data) {
            $("#inputPostcode").removeClass("is-invalid");
            var p = point([data['result']['longitude'], data['result']['latitude']]);
            var nearest = nearestPoint(p, gdata[active_chain]);
            map.flyTo({
                center: nearest.geometry.coordinates,
                zoom: 14,
                essential: true
            });
        })
        .fail(function() {
            $(".invalid-feedback").text("Enter a valid UK Post Code");
            $("#inputPostcode").addClass("is-invalid");
        });
});

$("#switch").click(function() {
    if (active_chain == "greggs") {
        active_chain = "pret";
        map
            .setLayoutProperty('greggs_points', 'visibility', 'none')
            .setLayoutProperty('greggs_heat', 'visibility', 'none')
            .setLayoutProperty('pret_points', 'visibility', 'visible')
            .setLayoutProperty('pret_heat', 'visibility', 'visible');
        $('#pcbutton')
            .text("Nearest Pret")
            .removeClass("greggs")
            .addClass("pret");
        $('#switch').text("Switch to Greggs");
    } else {
        active_chain = "greggs";
        map
            .setLayoutProperty('pret_points', 'visibility', 'none')
            .setLayoutProperty('pret_heat', 'visibility', 'none')
            .setLayoutProperty('greggs_points', 'visibility', 'visible')
            .setLayoutProperty('greggs_heat', 'visibility', 'visible');
        $('#pcbutton')
            .text("Nearest Greggs")
            .removeClass("pret")
            .addClass("greggs");
        $('#switch').text("Switch to Pret");
    }
});

// Locate nearest chain if geolocation is successful
function glSuccess(position) {
    var p = point([position.coords.longitude, position.coords.latitude]);
    var nearest = nearestPoint(p, gdata[active_chain]);
    map.flyTo({
        center: nearest.geometry.coordinates,
        zoom: 14,
        essential: true
    });
}

// If we can't geolocate for some reason
function glError() {
    $("#inputPostcode").addClass("is-invalid");
    $(".invalid-feedback").text("Couldn't geolocate you!");
}

$("#locate").click(function() {
    navigator.geolocation.getCurrentPosition(glSuccess, glError, {
        enableHighAccuracy: true,
        timeout: 2500
    });
});
