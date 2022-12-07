var width = 500;
var height = 500;
var data;
var extents;
var scales;
var titles;
var tooltip;
var sleepMetric = "Sleep1";
var heartRateMetric = "HeartRate1";

//create title for chart
var title = d3.select('svg')
    .append("text")
    .attr("x", width/2)
    .attr("y", 12)
    .attr("font-size", "12px")
    .text("Heart Rate vs. Sleep Metrics");

//load data
d3.csv("mock_data.csv", function (csv) {
    for (var i = 0; i < csv.length; ++i) {
        csv[i].HeartRate1 = Number(csv[i].HeartRate1);
        csv[i].HeartRate2 = Number(csv[i].HeartRate2);
        csv[i].Sleep1 = Number(csv[i].Sleep1);
        csv[i].Sleep2 = Number(csv[i].Sleep2);
    }
    data = csv;
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

    // create axes labels
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
    
    // creates groups for the axes
    d3.select('svg')
        .append("g") // create a group node
        .attr("id", "x-axis-g")
        .attr("transform", "translate(0," + (width - 30) + ")");
    
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
        .on("mouseover", function(d) { //change color on mouseover
            d3.select(this).classed("moused", true);
        })
        .on("mouseout", function(d) {
            d3.select(this).classed("moused", false);
        });

    // create the tooltip
    tooltip = d3.select('svg')
        .append("text")
        .attr("id", "tooltip")
        .style("visibility", "hidden"); //starts off hidden

    // clicking a circle
    d3.select('svg').on("click", function() {
        // if target is circle, copy above
        if (d3.event.target.classList.contains("data-circle")) {
            //unselect everything else
            d3.selectAll('circle').classed("selected", false);
            //select this one
            d3.select(d3.event.target).classed("selected", true);
            //update tooltip
            tooltip.style("visibility", "visible")
                .attr('x', d3.select(d3.event.target).attr("cx"))
                .attr('y', d3.select(d3.event.target).attr("cy"))
                .text(
                    formatTooltipText(d3.select(d3.event.target).data()[0][sleepMetric],
                    d3.select(d3.event.target).data()[0][heartRateMetric])
                );
        } else {
            // if somewhere else is clicked (other than a data point), clear all circles
            d3.selectAll('circle').classed("selected", false);
            tooltip.style("visibility", "hidden");
        }
    });

    // update chart with default metrics
    updateChart();
}

// function that updates the chart based on user selection of metrics
function updateChart() {
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
        .attr('cx', function(d) {
            return scales[sleepMetric](d[sleepMetric]);
        })
        .attr('cy', function(d) {
            return  scales[heartRateMetric](d[heartRateMetric]);
        });

    // if something is  selected, then update position of tooltip
    if (!d3.select(".selected").empty()) {
        var selected_circle = d3.select(".selected");
        tooltip.attr('x', selected_circle.attr("cx"))
            .attr('y', selected_circle.attr("cy"))
            .text(
                formatTooltipText(selected_circle.data()[0][sleepMetric],
                    selected_circle.data()[0][heartRateMetric])
            );
    }
}

// format text for tooltip
function formatTooltipText(sleep, heartRate) {
    return sleep + " " + heartRate;
}

// event handler for changing the metrics with the drop down
function onMetricChanged() {
    // save the user selection
    var select = d3.select('#sleepSelect').node();
    sleepMetric = select.options[select.selectedIndex].value;
    var select = d3.select('#heartRateSelect').node();
    heartRateMetric = select.options[select.selectedIndex].value;
    updateChart();
}