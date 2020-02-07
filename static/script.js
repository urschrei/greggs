import mapboxgl from 'mapbox-gl';
import nearestPoint from '@turf/nearest-point'
import {
    point,
    featureCollection
} from '@turf/helpers'
// import featureCollection from '@turf/helpers'
import 'bootstrap';
import './style.scss'
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

// This will hold our Greggs FeatureCollection for use in Turf after the map loads
const gdata = {};

map.on('load', function() {
    $.getJSON("static/latest_greggs.geojson")
        .done(function(data) {
            map.addSource("greggs", {
                    "type": "geojson",
                    "data": data
                })
                .addLayer({
                    "id": "greggs_points",
                    "type": "circle",
                    "source": "greggs",
                    "paint": {
                        "circle-color": "rgb(251, 169, 23)",
                        "circle-stroke-color": "rgb(8, 66, 125)",
                        "circle-stroke-width": 1.5,
                        "circle-opacity": [
                            'interpolate', ['linear'],
                            ['zoom'],
                            7,
                            0,
                            8,
                            1
                        ],
                        "circle-stroke-opacity": [
                            'interpolate', ['linear'],
                            ['zoom'],
                            7,
                            0,
                            8,
                            1
                        ]
                    }
                })
                .addLayer({
                        'id': 'greggs_heat',
                        'type': 'heatmap',
                        'source': 'greggs',
                        'maxzoom': 9,
                        'paint': {
                            // Increase the heatmap weight based on frequency
                            'heatmap-weight': [
                                'interpolate', ['linear'],
                                1.25,
                                0,
                                0,
                                6,
                                1
                            ],
                            // Increase the heatmap color weight by zoom level
                            // heatmap-intensity is a multiplier on top of heatmap-weight
                            'heatmap-intensity': [
                                'interpolate', ['linear'],
                                ['zoom'],
                                0,
                                1,
                                9,
                                3
                            ],
                            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                            // Begin color ramp at 0-stop with a 0-transparency color
                            // to create a blur-like effect.
                            // transitions from https://meyerweb.com/eric/tools/color-blend/#FBA917:08427D:4:rgbd
                            'heatmap-color': [
                                'interpolate', ['linear'],
                                ['heatmap-density'],
                                0,
                                'rgba(8, 66, 125, 0)',
                                0.2,
                                'rgb(57,87,105)',
                                0.4,
                                'rgb(105,107,84)',
                                0.6,
                                'rgb(154,128,64)',
                                0.8,
                                'rgb(202,148,43)',
                                1,
                                'rgb(251, 169, 23)'
                            ],
                            // Adjust the heatmap radius by zoom level
                            'heatmap-radius': [
                                'interpolate', ['linear'],
                                ['zoom'],
                                0,
                                2,
                                9,
                                20
                            ],
                            // Transition from heatmap to circle layer by zoom level
                            'heatmap-opacity': [
                                'interpolate', ['linear'],
                                ['zoom'],
                                7,
                                1,
                                9,
                                0
                            ]
                        }
                    },
                    'waterway-label'
                );
            // Assign our FeatureCollection to an empty global variable so we can use it elsewhere
            gdata['data'] = data;
        });
});

// When a click event occurs on a feature in the point layer, open a popup at the
// location of the feature, with post code and authority text from its properties.
map.on('click', 'greggs_points', function(e) {
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
map.on('mouseenter', 'greggs_points', function() {
    map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves
map.on('mouseleave', 'greggs_points', function() {
    map.getCanvas().style.cursor = '';
});

$("#lookup").submit(function(event) {
    event.preventDefault();
    $.getJSON("https://api.postcodes.io/postcodes/" + $("input").first().val())
        .done(function(data) {
            var p = point([data['result']['longitude'], data['result']['latitude']]);
            var coll = featureCollection(gdata['data']['features']);
            var nearest = nearestPoint(p, coll);
            map.flyTo({
                center: nearest.geometry.coordinates,
                zoom: 12,
                essential: true
            });
            console.log(nearest.geometry.coordinates);
        })
});
