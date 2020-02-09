import mapboxgl from 'mapbox-gl';
import nearestPoint from '@turf/nearest-point'
import {
    point,
    featureCollection
} from '@turf/helpers'
// import featureCollection from '@turf/helpers'
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

mapboxgl.accessToken = 'pk.eyJ1IjoidXJzY2hyZWkiLCJhIjoiY2pubHJsaGZjMWl1dzNrbzM3eDBuNzN3eiJ9.5xEWTiavcSRbv7LYZoAmUg';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    zoom: 5.205985389161131,
    center: {
        lng: -3.8,
        lat: 53.82777852234969
    },
});

// This will hold our FeatureCollections for use with Turf after the map loads
var gdata = {};
var active_chain = 'greggs';

map.on('load', function() {
    $.getJSON("static/latest_greggs.geojson")
        .done(function(data) {
            map.addSource("greggs", {
                    "type": "geojson",
                    "data": data
                })
                .addLayer(greggs_points)
                .addLayer(greggs_heat, 'waterway-label');
            // Assign our FeatureCollection to an empty global variable so we can use it elsewhere
            gdata['greggs'] = featureCollection(data['features']);
        });
    $.getJSON("static/latest_pret.geojson")
        .done(function(data) {
            map.addSource("pret", {
                    "type": "geojson",
                    "data": data
                })
                .addLayer(pret_points)
                .addLayer(pret_heat, 'waterway-label');
            // Assign our FeatureCollection to an empty global variable so we can use it elsewhere
            gdata['pret'] = featureCollection(data['features']);
        });
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
        var description = `<p>Post Code: ${e.features[0].properties.PostCode} in ${e.features[0].properties.LocalAuthorityName}</p><p>FHRS Rating, Feb 2020: ${e.features[0].properties.RatingValue}</p>`;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
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
            .text("Find nearest Pret")
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
            .text("Find nearest Greggs")
            .removeClass("pret")
            .addClass("greggs");
        $('#switch').text("Switch to Pret");
    }
});

// Locate nearest chain if geolocation is successful
function glSuccess(position) {
    console.log(position.coords.longitude, position.coords.latitude)
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
