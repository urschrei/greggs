var greggs_points = {
    "id": "greggs_points",
    "type": "circle",
    "source": "greggs",
    "minzoom": 7,
    "paint": {
        'circle-radius': {
            stops: [
                [9, 10],
                [11, 20],
                [16, 35]
            ]
        },
        "circle-color": "rgb(251, 169, 23)",
        "circle-stroke-color": "rgb(8, 66, 125)",
        "circle-stroke-width": 1.5,
        "circle-opacity": [
            'interpolate', ['linear'],
            // zoom -> input: output
            ['zoom'],
            7, 0,
            8, 1,
            9, 0.5
        ],
        "circle-stroke-opacity": [
            'interpolate', ['linear'],
            ['zoom'],
            7, 0,
            8, 1
        ]
    }
}

var greggs_heat = {
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
}

var pret_points = {
    "id": "pret_points",
    "type": "circle",
    "source": "pret",
    "minzoom": 7,
    'layout': {'visibility': 'none'},
    "paint": {
        'circle-radius': {
            stops: [
                [9, 10],
                [11, 20],
                [16, 35]
            ]
        },
        "circle-color": "rgb(140, 29, 38)",
        "circle-stroke-color": "rgb(255, 255, 255)",
        "circle-stroke-width": 1.5,
        "circle-opacity": [
            'interpolate', ['linear'],
            // zoom -> input: output
            ['zoom'],
            7, 0,
            8, 1,
            9, 0.5
        ],
        "circle-stroke-opacity": [
            'interpolate', ['linear'],
            ['zoom'],
            7, 0,
            8, 1
        ]
    }
}

var pret_heat = {
    'id': 'pret_heat',
    'type': 'heatmap',
    'source': 'pret',
    'maxzoom': 9,
    'layout': {'visibility': 'none'},
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
        // transitions from https://meyerweb.com/eric/tools/color-blend/#FFFF22B:8C1D26:4:rgbd
        'heatmap-color': [
            'interpolate', ['linear'],
            ['heatmap-density'],
            0,
            'rgba(255, 255, 255, 0)',
            0.2,
            'rgb(232, 210, 452)',
            0.4,
            'rgb(209, 165, 348)',
            0.6,
            'rgb(186, 119, 245)',
            0.8,
            'rgb(163, 74, 141)',
            1,
            'rgb(140, 29, 38)'
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
}

export {
    greggs_points,
    greggs_heat,
    pret_points,
    pret_heat
};
