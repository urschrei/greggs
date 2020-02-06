// Initial Mapbox GL Layer Styles

// A Fill Layer
var polygon_style = {
    // order here is true, false
    'fill-color': 'blue',
    'fill-opacity': ['match', ['id'],
        [100000], 0.8, 0
    ],
    'fill-outline-color': '#676767',
};

// A Point Layer
var point_style = {
    // order here is true, false
    'circle-opacity': ['match', ['id'],
        [100000], 0.8, 0
    ],
    'circle-stroke-opacity': ['match', ['id'],
        [100000], 0.8, 0
    ],
    'circle-color': '#004080',
    'circle-stroke-color': '#676767',
    'circle-stroke-width': 2,
};


var infraChartOptions = {
    legend: {
        display: false
    },
    scales: {
        yAxes: [{
            gridLines: {
                display: false,
                drawBorder: false,
            },
        }],
        xAxes: [{
            ticks: {
                suggestedMax: 100
            },
            gridLines: {
                display: false,
                drawBorder: false,
            },
        }],
    },
};

export {
    polygon_style,
    point_style,
    infraChartOptions
};
