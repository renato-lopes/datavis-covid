
function streamgraph(csvpath, title, caselabel, Ydomain) {

  // set the dimensions and margins of the graph
  var margin = { top: 20, right: 70, bottom: 60, left: 60 };
  var width = document.body.clientWidth - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#streamgraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  // Parse the Data
  d3.csv(csvpath, function (d) {
    d.day = d3.timeParse("%Y-%m-%d")(d.day);
    d.value = +d.value;
    d.key = d.key;
    return d;
  })
    .then(function (data) {

     
      // List of groups = header of the csv files
      var keys = data.columns.slice(1)
      
      // Add X axis
      var x = d3.scaleTime()
        .domain(d3.extent(data, function (d) { return d.day; }))
        .range([0, width]);

      var xAxis = d3.axisBottom()
        .scale(x)
        .ticks(width / 80)
        .tickSizeOuter(0)

      // Customization
      svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

      // Add title
      svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 4))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(title);

      // Add Y axis
      var y = d3.scaleLinear()
        .domain(Ydomain)
        .range([height, 0]);

      // color palette
      var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeDark2);

      //stack the data?
      var stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys)
        (data)

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function (d) {
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this)
          // .style("stroke", "black")
          .style("opacity", 1)

      }

      var mousemove = function (d, i) {
        mousex = d3.pointer(d);
        mousex = mousex[0];
        var invertedx = x.invert(mousex);

        var selected = i;
        for (var k = 0; k < selected.length; k++) {
          date_array = selected[k].data.day
          let d1 = invertedx.getDate() + '-' + invertedx.getMonth() + '-' + invertedx.getYear()
          let d2 = date_array.getDate() + '-' + date_array.getMonth() + '-' + date_array.getYear()
          if (d1 === d2) {
            break
          }
        }

        pro = i[k].data;
        //inicio
        const selectedData = i[k];
        const min = d3.min(stackedData, d => d[k][0]);
        const max = d3.max(stackedData, d => d[k][1]);
        line
          .attr("x1", x(invertedx))
          .attr("x2", x(invertedx))
          .attr("y1", y(selectedData[0]))
          .attr("y2", y(selectedData[1]));

        bigLine
          .attr("x1", x(invertedx))
          .attr("x2", x(invertedx))
          .attr("y1", y(min))
          .attr("y2", y(max));

        stateLabel
          .attr("x", d3.max([d3.min([x(invertedx), width - 120]), 120]))
          .attr("y", d3.max([y(max) - 40, 20]))
          .text(i.key + ' - ' + new Date(invertedx).toLocaleDateString());
        caseLabel
          .attr("x", d3.max([d3.min([x(invertedx), width - 120]), 120]))
          .attr("y", d3.max([y(max) - 20, 40]))
          .text(pro[i.key] + ' ' + caselabel);

      }

      var mouseleave = function (d) {
        line
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("y1", 0)
          .attr("y2", 0);
        bigLine
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("y1", 0)
          .attr("y2", 0);
        stateLabel.text("");
        caseLabel.text("");
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
      }

      // Area generator
      var area = d3.area()
        .x(function (d) { return x(d.data.day); })
        .y0(function (d) { return y(d[0]); })
        .y1(function (d) { return y(d[1]); })


      // Show the areas
      svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .attr("class", "myArea")
        .style("fill", function (d) { return color(d.key); })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

      // // Add X Axis
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      // Create line indication
      const bigLine = svg
        .append("line")
        .attr("stroke", "black")
        .attr("opacity", .8)
        .attr("stroke-dasharray", 3, 4)
        .attr("pointer-events", "none");

      const line = svg
        .append("line")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("pointer-events", "none");

      const textArea = svg.append("g").attr("pointer-events", "none");
      const stateLabel = textArea
        .append("text")
        .attr("font-size", 16)
        .attr("text-anchor", "middle");
      const caseLabel = textArea
        .append("text")
        .attr("font-size", 16)
        .attr("text-anchor", "middle");


    })

}


streamgraph("data/covid/new_cases.csv", "Reported Cases", 'Cases', [-60000, 60000]);
streamgraph("data/covid/new_cases_media.csv", "(Rolling Avg) Reported Cases", 'Cases', [-60000, 60000]);
streamgraph("data/covid/new_deaths.csv", "Reported Deaths", 'Deaths', [-2000, 2000]);
streamgraph("data/covid/new_deaths_media.csv", "(Rolling Avg) Reported Deaths", 'Deaths', [-2000, 2000]);
