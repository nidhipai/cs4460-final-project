var width = 500;
var height = 500;
var data;
var extents;
var scales;
var titles;
var tooltip;
var sleepMetric = "Total Sleep Duration";
var heartRateMetric = "Average Resting Heart Rate";
var startDate = "2022-01-01";
var endDate = "2022-11-19";

//load data
d3.csv("data.csv", function (csv) {
    for (var i = 0; i < csv.length; ++i) {
        csv[i].HeartRate1 = Number(csv[i].HeartRate1);
        csv[i].HeartRate2 = Number(csv[i].HeartRate2);
        csv[i].Sleep1 = Number(csv[i].Sleep1);
        csv[i].Sleep2 = Number(csv[i].Sleep2);
    }
    data = csv;
    initChart();
});

var sleepMetrics = ['Total Sleep Duration', 'Total Bedtime', 'Awake Time', 'REM Sleep Duration', 'Light Sleep Duration', 'Deep Sleep Duration', 'Bedtime Start', 'Bedtime End']
var heartMetrics = ['Average Resting Heart Rate', 'Lowest Resting Heart Rate', 'Average HRV', 'Temperature Deviation (°C)', 'Temperature Trend Deviation', 'Respiratory Rate']

d3.csv("data.csv", function (csv) {
    for (var i = 0; i < csv.length; i++) {
        for (var j = 0; j < sleepMetrics.length; j++) {
            csv[i].sleepMetrics[j] = Number(csv[i].sleepMetrics[j]);
        }
        for (var j = 0; j < heartMetrics.length; j++) {
            csv[i].heartMetrics[j] = Number(csv[i].heartMetrics[j]);
        }
        // csv[i]['Date'] = Date.parse(csv[i]['Date']);
    }
    data = csv;
    initChart();
})

function initChart() {
    extents = {
        "Total Sleep Duration": d3.extent(data, function (row) { return row['Total Sleep Duration']; }),
        "REM Sleep Duration": d3.extent(data, function (row) { return row['REM Sleep Duration']; }),
        "Bedtime Start": d3.extent(data, function (row) { return row['Bedtime Start']; }),
        "Bedtime End": d3.extent(data, function (row) { return row['Bedtime End']; }),

        "Average Resting Heart Rate": d3.extent(data, function (row) { return row['Average Resting Heart Rate']; }),
        "Average HRV": d3.extent(data, function (row) { return row['Average HRV']; }),
        "Temperature Deviation (°C)": d3.extent(data, function (row) { return row['Temperature Deviation (°C)']; }),
    }
    scales = {
        "Total Sleep Duration": d3.scaleLinear().domain(extents["Total Sleep Duration"]).range([50, 470]),
        "REM Sleep Duration": d3.scaleLinear().domain(extents["REM Sleep Duration"]).range([50, 470]),
        "Bedtime Start": d3.scaleLinear().domain([-3, 6]).range([50, 470]),
        "Bedtime End": d3.scaleLinear().domain([5, 14]).range([50, 470]),

        "Average Resting Heart Rate": d3.scaleLinear().domain(extents["Average Resting Heart Rate"]).range([470, 30]),
        "Average HRV": d3.scaleLinear().domain(extents["Average HRV"]).range([470, 30]),
        "Temperature Deviation (°C)": d3.scaleLinear().domain([-1, 1.5]).range([470, 30])
    }
    titles = {
        "Total Sleep Duration": "Total Sleep Duration",
        "REM Sleep Duration": "REM Sleep Duration",
        "Bedtime Start": "Bedtime Start",
        "Bedtime End": "Bedtime End",

        "Average Resting Heart Rate": "Average Resting Heart Rate",
        "Average HRV": "Average HRV",
        "Temperature Deviation (°C)": "Temperature Deviation (°C)"
    }

    var chart = d3.select('svg');

    //create title for chart
    var title = chart
        .append("text")
        .attr("x", width/2)
        .attr("y", 12)
        .attr("font-size", "12px")
        .attr("text-anchor", "middle")
        .text("Heart Rate vs. Sleep Metrics");

    // create axes labels
    var sleepLabel = chart
        .append("text")
        .attr("x", width/2)
        .attr("y", height-3)
        .attr("id", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px");
    var heartRateLabel = chart
        .append("text")
        .attr("x", -width/2)
        .attr("y", 20)
        .attr("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("id", "y-axis-label");
    
    // creates groups for the axes
    chart
        .append("g") // create a group node
        .attr("id", "x-axis-g")
        .attr("transform", "translate(0," + (height - 30) + ")");
    
    chart // or something else that selects the SVG element in your visualizations
        .append("g") // create a group node
        .attr("id", "y-axis-g")
        .attr("transform", "translate(50, 0)");

    // create data points
    var circles = chart.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr('r', 5)
        .attr('date', function(d) {
            return d.Date;
        })
        .classed("data-circle", true)
        .on("mouseover", function(d) { //change color on mouseover
            d3.select(this).classed("moused", true);
        })
        .on("mouseout", function(d) {
            d3.select(this).classed("moused", false);
        });
        // .data(data, function(d) {
        //     return d.Date});

    // create the tooltip
    tooltip = chart
        .append("text")
        .attr("id", "tooltip")
        .style("visibility", "hidden"); //starts off hidden

    // clicking a circle
    chart.on("click", function() {
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
        })
        .classed("out-of-date", false)
        .classed("out-of-date", function(d) {
            return !(Date.parse(d.Date) >= Date.parse(startDate) && Date.parse(d.Date) <= Date.parse(endDate));
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
    startDate = document.querySelector('#startDateSelect').value;
    endDate = document.querySelector('#endDateSelect').value;
    console.log(startDate);
    console.log(endDate);
    updateChart();
}