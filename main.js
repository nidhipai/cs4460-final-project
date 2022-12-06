var width = 500;
var height = 500;
var data;
var extents;
var scales;
var titles;

// create chart + labels
console.log('check 1');
// var chart = d3 // this seems like a hack
//     .select("#chart")
//     .append("svg")
//     .attr("id", "svg-main")
//     .attr("width", width)
//     .attr("height", height);
var chart = d3.select('svg');
var chartG = chart.append('g');
console.log(chart);
var title = chartG
    .append("text")
    .attr("x", width/2)
    .attr("y", 12)
    .attr("font-size", "12px")
    .text("Heart Rate vs. Sleep Metrics");


d3.csv("mock_data.csv", function (csv) {
    for (var i = 0; i < csv.length; ++i) {
        csv[i].HeartRate1 = Number(csv[i].HeartRate1);
        csv[i].HeartRate2 = Number(csv[i].HeartRate2);
        csv[i].Sleep1 = Number(csv[i].Sleep1);
        csv[i].Sleep2 = Number(csv[i].Sleep2);
    }
    data = csv;
    console.log(csv);
    initChart();
});

function initChart() {
    extents = {
        "Sleep1": d3.extent(data, function (row) { return row.Sleep1; }),
        "Sleep2": d3.extent(data, function (row) { return row.Sleep2; }),
        "HeartRate1": d3.extent(data, function (row) { return row.HeartRate1; }),
        "HeartRate2": d3.extent(data, function (row) { return row.HeartRate2; })
    }
    scales = {
        "Sleep1": d3.scaleLinear().domain(extents["Sleep1"]).range([50, 470]),
        "Sleep2": d3.scaleLinear().domain(extents["Sleep2"]).range([50, 470]),
        "HeartRate1": d3.scaleLinear().domain(extents["HeartRate1"]).range([470, 30]),
        "HeartRate2": d3.scaleLinear().domain(extents["HeartRate2"]).range([470, 30])
    }
    titles = {
        "Sleep1": "Sleep 1",
        "Sleep2": "Sleep 2",
        "HeartRate1": "Heart Rate 1",
        "HeartRate2": "Heart Rate 2"
    }

    var sleepLabel = d3.select('svg')
        .append("text")
        .attr("x", width/2)
        .attr("y", height)
        .attr("id", "x-axis-label")
        .attr("font-size", "12px");
    var heartRateLabel = d3.select('svg')
        .append("text")
        .attr("x", -width/2)
        .attr("y", 20)
        .attr("font-size", "12px")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("id", "y-axis-label");
    
    d3.select('svg')
        .append("g") // create a group node
        .attr("id", "x-axis-g")
        .attr("transform", "translate(0," + (width - 30) + ")"); // note I deleted a ton of stuff here, see lab4
        // not sure if that did anything
    
    d3.select('svg') // or something else that selects the SVG element in your visualizations
        .append("g") // create a group node
        .attr("id", "y-axis-g")
        .attr("transform", "translate(50, 0)");

    // create data points
    var circles = d3.select('svg').selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr('r', 5)
        .classed("data-circle", true)
        .on("mouseover", function(d) {
            d3.select(this).classed("moused", true);
        })
        .on("mouseout", function(d) {
            d3.select(this).classed("moused", false);
        });

    d3.select('svg').on("click", function() {
        // if target is circle, copy above
        if (d3.event.target.classList.contains("data-circle")) {
            console.log(d3.event.target);
            //unselect everything else
            d3.selectAll('circle').classed("selected", false);
            //select this one
            d3.select(d3.event.target).classed("selected", true);
            //display tooltip
            //TO DO
        } else {
            // if somewhere else is clicked (other than a data point), clear all circles
            d3.selectAll('circle').classed("selected", false);
        }
    });

    updateChart("Sleep1", "HeartRate1");
}

function updateChart(sleepMetric, heartRateMetric) {
    // update axes
    var xAxis = d3.axisBottom().scale(scales[sleepMetric]);
    var yAxis = d3.axisLeft().scale(scales[heartRateMetric]);
    d3.select('#x-axis-g').call(xAxis);
    d3.select('#y-axis-g').call(yAxis);

    //update lablels on axes
    d3.select('#x-axis-label').text(titles[sleepMetric]);
    d3.select('#y-axis-label').text(titles[heartRateMetric]);

    // update data points
    d3.selectAll(".data-circle")
        .attr('transform', function(d) {
            console.log(d);
            var xpos = scales[sleepMetric](d[sleepMetric]);
            var ypos = scales[heartRateMetric](d[heartRateMetric]);
            return "translate(".concat(xpos, ", ", ypos, ")");
        });
}

function onMetricChanged() {
    console.log('Metric changed');
    var select = d3.select('#sleepSelect').node();
    var sleepMetric = select.options[select.selectedIndex].value; //might want to make this a global variable
    var select = d3.select('#heartRateSelect').node();
    var heartRateMetric = select.options[select.selectedIndex].value;
    updateChart(sleepMetric, heartRateMetric);
}