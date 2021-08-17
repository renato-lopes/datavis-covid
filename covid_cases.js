function plot_vaccinations(parent, state) {
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 60, bottom: 30, left: 60},
      width = 1000 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = parent
    .append("div")
      .classed("col-md-8", true)
      .classed("mb-2", true)
    .append("svg")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")"); 

  d3.csv(`data/covid/states/${state}.csv`, function(d){
    d.date = d3.timeParse("%Y-%m-%d")(d.date);
    return d;
    })
    .then(function (data) {
      // X axis
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
      svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        // .attr("transform", "translate(-10,0)rotate(-45)")
        // .style("text-anchor", "end");

      // Add Y axis
      var y = d3.scaleLinear()
      .domain([0, 100])
      .range([ height, 0]);
      svg.append("g")
      .attr("transform", `translate(${width+1},0)`)
      .call(d3.axisRight(y));

      // Bars
      svg.selectAll("firstdose")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.date) - (width/data.length)/2; })
        .attr("y", function(d) { return y(d.vaccinated_per_100_inhabitants); })
        .attr("width", width/data.length)
        .attr("height", function(d) { return height - y(d.vaccinated_per_100_inhabitants); })
        .attr("fill", "#69b3a2")
      
      svg.selectAll("seconddose")
        .data(data)
        .enter()
        .append("rect")
          .attr("x", function(d) { return x(d.date) - (width/data.length)/2; })
          .attr("y", function(d) { return y(d.vaccinated_second_per_100_inhabitants); })
          .attr("width", width/data.length)
          .attr("height", function(d) { return height - y(d.vaccinated_second_per_100_inhabitants); })
          .attr("fill", "#0c7af0")
      
      // Title
      // svg.append("text")
      //   .attr("x", (width / 2))             
      //   .attr("y", -16)
      //   .attr("text-anchor", "middle")  
      //   .style("font-size", "16px") 
      //   .style("font-family", "sans-serif")
      //   .text(`Effects of Vaccination on Reported Cases in ${state}`);
      
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0-margin.right)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .style("font-size", "14px") 
        .style("font-family", "sans-serif")
        .text("New Daily Cases");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", width+36)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .style("font-size", "14px") 
        .style("font-family", "sans-serif")
        .text("% population vaccinated");
      
      }
  )
  d3.csv(`data/covid/states/${state}.csv`, function(d){
    return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.newCasesRolling }
    })
    .then(function (data) {
      // Add X axis --> it is a date format
      var x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date; }))
        .range([ 0, width ]);
    
      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.value; })])
        // .domain([0, 300])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));
    
      // Add the line
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return x(d.date) })
          .y(function(d) { return y(d.value) })
        )
      // This allows to find the closest X index of the mouse:
      var bisect = d3.bisector(function(d) { return d.date; }).left;

      // Create the circle that travels along the curve of chart
      var focus = svg
        .append('g')
        .append('circle')
          .style("fill", "black")
          .attr("stroke", "black")
          .attr('r', 3)
          .style("opacity", 0)

      // Create the text that travels along the curve of chart
      var focusText1 = svg
        .append('g')
        .append('text')
          .style("opacity", 0)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
      var focusText2 = svg
        .append('g')
        .append('text')
          .style("opacity", 0)
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
      // Create a rect on top of the svg area: this rectangle recovers mouse position
      svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);
      
      // What happens when the mouse move -> show the annotations at the right positions.
      function mouseover() {
        focus.style("opacity", 1)
        focusText1.style("opacity",1)
        focusText2.style("opacity",1)
      }

      function mousemove(d, i) {
        // recover coordinate we need
        var mousex = d3.pointer(d);
        mousex = mousex[0];
        var x0 = x.invert(mousex);
        var i = bisect(data, x0, 1);
        selectedData = data[i]
        focus
          .attr("cx", x(selectedData.date))
          .attr("cy", y(selectedData.value))
        focusText1
          .html(selectedData.date.toLocaleDateString('pt-BR'))
          .attr("x", d3.max([d3.min([x(selectedData.date), width - 50]), 50]))
          .attr("y", d3.max([y(selectedData.value)-40, 20]))
        focusText2
          .html(Math.ceil(selectedData.value))
          .attr("x", d3.max([d3.min([x(selectedData.date), width - 50]), 50]))
          .attr("y", d3.max([y(selectedData.value)-20, 40]))
      }
      
      function mouseout() {
        focus.style("opacity", 0)
        focusText1.style("opacity", 0)
        focusText2.style("opacity", 0)
      }

    }
  )
}

function process_vaccine_name(name) {
  switch(name){
    case "Covid-19-AstraZeneca":
      return "Astrazeneca";
      break;
    case "Covid-19-Coronavac-Sinovac/Butantan":
      return "Coronavac";
    case "Vacina Covid-19 - Covishield":
      return "Astrazeneca";
      break;
    case "Vacina covid-19 - Ad26.COV2.S - Janssen-Cilag":
      return "Janssen";
      break;
    case "Vacina covid-19 - BNT162b2 - BioNTech/Fosun Pharma/Pfizer":
      return "Pfizer";
      break;
  }
}

function prepare_vaccine_data(data) {
  let i = -1;
  let newArray = [];
  for (let j = 0; j<data.length; j++) {
    if (data[j].name === "Astrazeneca" ) {
      if (i === -1) {
        i = j;
        newArray.push(data[j]);
      } else {
        newArray[i].percentage = (newArray[i].percentage || 0) + (data[j].percentage || 0)
      }
    } else {
      newArray.push(data[j]);
    }
  }
  return newArray;
}

function plot_vaccine_type(parent, state) {
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 30, bottom: 50, left: 30},
      width = 200 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = parent
    .append("div")
      .classed("col-md-2", true)
      .classed("mb-2", true)
    .append("svg")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")"); 

  d3.csv(`data/vacina/vacinas.csv`, function(d){
    if (d.vacina_nome !== "Pendente Identificação") { return { name: process_vaccine_name(d.vacina_nome), percentage: parseFloat(d[state]) }; }
    })
    .then(function (data) {
      data = prepare_vaccine_data(data);
      // X axis
      var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.name; }))
        .padding(0.2);
      svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

      // Add Y axis
      var y = d3.scaleLinear()
      .domain([0, 100])
      .range([ height, 0]);
      svg.append("g")
      .attr("transform", `translate(${width+1},0)`)
      .call(d3.axisRight(y));

      // Bars
      svg.selectAll("vaccines")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.name); })
        .attr("y", function(d) { return y(d.percentage); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.percentage); })
        .attr("fill", "#2ade5a")
      
      svg.selectAll(".labels")        
        .data(data)
        .enter()
        .append("text")
        .attr("class","label")
        .attr("x", (function(d) { return x(d.name); }  ))
        .attr("y", function(d) { return y(d.percentage) - 15; })
        .attr("dy", ".75em")
        .text(function(d) { return d.percentage.toFixed(1); }); 
      
      }
  )
}

function draw_state(parent, state) {
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 30, bottom: 50, left: 30},
      width = 200 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = parent
    .append("div")
      .classed("col-md-2", true)
      .classed("mb-2", true)
    .append("svg")
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
    .call(d3.zoom()
      .on('zoom', (event, feature) => {
        svg.style("stroke-width", 1.5 / event.transform.k + "px");
        svg.attr('transform', event.transform);
      })
      .scaleExtent([1, 5])
    )
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")"); 

  d3.json("br-states.json")
    .then(data => {
      var states = topojson.feature(data, data.objects.estados);
      var states_contour = topojson.mesh(data, data.objects.estados);

      var projection = d3.geoMercator()
          .scale(200)
          .center([-52, -15])
          .translate([width / 2, height / 2]);
      
      var path = d3.geoPath()
          .projection(projection);


      // Desenhando estados
      svg.selectAll(".estado")
          .data(states.features)
          .enter()
          .append("path")
          .attr("class", "state")
          .attr("d", path);

      // Destaca estado
      svg.selectAll(".estado")
          .data([states.features.find(element => element.id === state)])
          .enter()
          .append("path")
          .attr("class", "state-highlighted")
          .attr("d", path);

      svg.append("path")
          .datum(states_contour)
          .attr("d", path)
          .attr("class", "state_contour");
  });
}

let states = ['MA', 'AM', 'PR', 'SP', 'MG', 'CE', 'DF', 'RS'];

for (const state of states) {
  parent = d3.select("#cases-graphs").append('div').classed('row', 'true').attr("id", state+"-graph").classed("mb-4", "true").classed("graph_row", "true");
  parent.append('div').classed('bottomright', 'true').append('p').text(state);
  draw_state(parent, state);
  plot_vaccinations(parent, state);
  plot_vaccine_type(parent, state);
}

for (const state of states.sort()) {
  let div = d3.select(".state-selection").append("div").classed("form-check", "true").classed("form-check-inline", "true");
  div.append("input").classed("form-check-input", 'true').attr("type", "checkbox").attr("id", state).attr("value", "").property("checked", "true").attr("onchange", "updateStates();");
  div.append("label").classed("form-check-label", 'true').attr("for", state).text(state);
}

function updateStates() {
  for (const state of states) {
    if (d3.select("#"+state).property("checked") === true) {
      console.log("#"+state+"-graph");
      d3.select("#"+state+"-graph").classed("d-md-none", false);
    } else {
      d3.select("#"+state+"-graph").classed("d-md-none", true);
    }
  }
}
