chart("data/covid/new_cases.csv", "orange", "Reported Cases in MG, SP, AM, CE, MA and PR");
chart("data/covid/new_cases_media.csv", "orange", "(Media) Reported Cases in MG, SP, AM, CE, MA and PR");
chart("data/covid/new_deaths.csv", "pink", "Reported Deaths in MG, SP, AM, CE, MA and PR");
chart("data/covid/new_deaths_media.csv", "pink", "(Media)Teste Reported Deaths in MG, SP, AM, CE, MA and PR");
var datearray = [];
var colorrange = [];


function chart(csvpath, color, title) {

    if (color == "blue") {
        colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
    }
    else if (color == "pink") {
        colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
    }
    else if (color == "orange") {
        colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
    }
    strokecolor = colorrange[0];

    var format = d3.time.format("%Y-%m-%d");

    var margin = { top: 20, right: 70, bottom: 60, left: 60 };
    var width = document.body.clientWidth - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);


    var y = d3.scale.linear()
        .range([height - 10, 0]);

    var z = d3.scale.ordinal()
        .range(colorrange);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(d3.time.weeks);

    var stack = d3.layout.stack()
        .offset("silhouette")
        .values(function (d) { return d.values; })
        .x(function (d) { return d.date; })
        .y(function (d) { return d.value; });

    var nest = d3.nest()
        .key(function (d) { return d.key; });

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) { return x(d.date); })
        .y0(function (d) { return y(d.y0); })
        .y1(function (d) { return y(d.y0 + d.y); });

    var svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 4))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(title);

    var Tooltip = svg.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .style("font-size", 17)

    var graph = d3.csv(csvpath, function (data) {
        data.forEach(function (d) {
            d.date = format.parse(d.date);
            d.value = +d.value;
        });

        var layers = stack(nest.entries(data));

        x.domain(d3.extent(data, function (d) { return d.date; }));
        y.domain([0, d3.max(data, function (d) { return d.y0 + d.y; })]);

        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", function (d) { return area(d.values); })
            .style("fill", function (d, i) { return z(i); });


        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");


        svg.selectAll(".layer")
            .attr("opacity", 1)
            .on("mouseover", function (d, i) {
                Tooltip.style("opacity", 1)
                svg.selectAll(".layer").transition()
                    .duration(250)
                    .attr("opacity", function (d, j) {
                        return j != i ? 0.6 : 1;
                    })
            })

            .on("mousemove", function (d, i) {

                mousex = d3.mouse(this);
                mousex = mousex[0];
                var invertedx = x.invert(mousex);
                invertedx = invertedx.getMonth() + invertedx.getDate() + invertedx.getYear();

                var selected = (d.values);
                for (var k = 0; k < selected.length; k++) {
                    datearray[k] = selected[k].date
                    datearray[k] = datearray[k].getMonth() + datearray[k].getDate() + datearray[k].getYear();
                }

                mousedate = datearray.indexOf(invertedx);

                pro = d.values[mousedate].value;
                Tooltip.text(d.key)

            })
            .on("mouseout", function (d, i) {
                Tooltip.style("opacity", 0)
                svg.selectAll(".layer")
                    .transition()
                    .duration(250)
                    .attr("opacity", "1");
            })

        var vertical = d3.select(".chart")
            .append("div")
            .attr("class", "remove")
            .style("position", "absolute")
            .style("z-index", "19")
            .style("width", "1px")
            .style("height", "380px")
            .style("top", "10px")
            .style("bottom", "30px")
            .style("left", "0px")
            .style("background", "#fff");

        d3.select(".chart")
            .on("mousemove", function () {
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px")
            })
            .on("mouseover", function () {
                mousex = d3.mouse(this);
                mousex = mousex[0] + 5;
                vertical.style("left", mousex + "px")
            });
    });
}