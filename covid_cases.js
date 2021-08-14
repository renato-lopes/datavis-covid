function plot_vaccinations(parent, state) {
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 60, bottom: 30, left: 60},
      width = 1000 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = parent
    .append("div")
      .classed("col-md-10", true)
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

let states = ['MA', 'AM', 'PR', 'SP', 'MG', 'CE'];

for (const state of states) {
  parent = d3.select("#cases-graphs").append('div').classed('row', 'true');
  plot_vaccinations(parent, state);
  plot_vaccine_type(parent, state);
}