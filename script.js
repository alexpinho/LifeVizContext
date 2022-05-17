const dataTable = "./data/LifeExpectancyData_clean.csv";

var margin = { top: 20, right: 30, bottom: 30, left: 60 },
  width = 960 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let uniqueListOfYears = [];

// Group Countries
d3.dsv(";", dataTable).then(function (data) {
  var dataByCountry = d3.group(
    data,
    (d) => d.Country,
    (d) => d.Life_expectancy
  );

  let aggregatedData = d3.group(
    data,
    (d) => d.Year,
    (d) => d.Country
  );

  console.log(aggregatedData);

  let test = Array.from(aggregatedData).map((obj) => {
    return {
      year: new Date(obj[0]),
      countries: Array.from(obj[1]).map((b) => {
        let a = {};
        a[b[0]] = +b[1][0].Life_expectancy;
        return a;
        //return {b[0]: b[1][0].Life_expectancy};
      }),
    };
  });

  const listOfYears = data.map((d) => d.Year);
  uniqueListOfYears = [...new Set(listOfYears)];

  // Add X axis
  const x = d3
    .scaleLinear()
    .domain(
      d3.extent(data, function (d) {
        return d.Year;
      })
    )
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height * 0.8})`)
    .call(
      d3
        .axisBottom(x)
        .tickSize(-height * 0.7)
        .tickValues([
          2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010,
          2011, 2012, 2013, 2014, 2015,
        ])
        .tickFormat(d3.format("d"))
    )
    .select(".domain")
    .remove();

  // Customization
  svg.selectAll(".tick line").attr("stroke", "#B4B4B4");

  // Add X axis label:
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 30)
    .text("Time (year)");

  // Add Y axis
  const y = d3.scaleLinear().domain([-10000, 10000]).range([height, 0]);

  // color palette
  const color = d3.scaleOrdinal().domain(dataByCountry).range(d3.schemeDark2);

  const countries = Array.from(dataByCountry.keys());

  //stack the data?
  const stackedData = d3
    .stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(countries)
    .value((obj, key) => {
      //console.log("c", obj);
      obj.countries[key];
    });

  let stacked = stackedData(test);

  console.log("staked", stacked);

  // Area generator
  const area = d3
    .area()
    .x(function (d) {
      return x(d.Year);
    })
    .y0(function (d) {
      return y(d[0]);
    })
    .y1(function (d) {
      return y(d[1]);
    });

  // Show the areas
  svg
    .selectAll("mylayers")
    .data(stacked)
    .join("path")
    .attr("class", "myArea")
    .style("fill", "red")
    .attr("d", area);
});
