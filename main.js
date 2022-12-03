var width = 500;
var height = 500;

d3.csv("mock_data.csv", function (csv) {
    for (var i = 0; i < csv.length; ++i) {
        csv[i].HeartRate1 = Number(csv[i].HeartRate1);
        csv[i].HeartRate2 = Number(csv[i].HeartRate2);
        csv[i].Sleep1 = Number(csv[i].Sleep1);
        csv[i].Sleep2 = Number(csv[i].Sleep2);
    }

    console.log(csv);

    // Functions used for scaling axes +++++++++++++++
    var heartRate1Extent = d3.extent(csv, function (row) {
        return row.HeartRate1;
    });
    var sleep1Extent = d3.extent(csv, function (row) {
        return row.Sleep1;
    });
    // add the other 2 here

    // Axis setup
    var xScale = d3.scaleLinear().domain(sleep1Extent).range([50, 470]);
    var yScale = d3.scaleLinear().domain(heartRate1Extent).range([470, 30]);

    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);

    // create chart + labels
    var chart = d3
        .select("#chart")
        .append("svg:svg")
        .attr("id", "svg-main")
        .attr("width", width)
        .attr("height", height);
    var title = d3
        .select("#svg-main")
        .append("text")
        .attr("x", width/2)
        .attr("y", 12)
        .attr("font-size", "12px")
        .text("Heart Rate vs. Sleep Metrics");
    var sleepLabel = d3
        .select("#svg-main")
        .append("text")
        .attr("x", width/2)
        .attr("y", height)
        .attr("font-size", "12px")
        .text("Sleep"); // will eventually need to be dynamic
    var heartRateLabel = d3
        .select("#svg-main")
        .append("text")
        .attr("x", -width/2)
        .attr("y", 20)
        .attr("font-size", "12px")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .text("Heart Rate");

    // create data points
    circles = chart.selectAll("circle")
        .data(csv)
        .enter()
        .append("circle")
        .attr('r', 5)
        .attr('transform', function(d) {
            var xpos = xScale(d.Sleep1);
            var ypos = yScale(d.HeartRate1);
            return "translate(".concat(xpos, ", ", ypos, ")");
        })
        .classed("data-circle", true);

    chart // or something else that selects the SVG element in your visualizations
        .append("g") // create a group node
        .attr("transform", "translate(0," + (width - 30) + ")")
        .call(xAxis) // call the axis generator
        .append("text")
        .attr("class", "label")
        .attr("x", width - 16)
        .attr("y", -6)
        .style("text-anchor", "end");

    chart // or something else that selects the SVG element in your visualizations
        .append("g") // create a group node
        .attr("transform", "translate(50, 0)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

});