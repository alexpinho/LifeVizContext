const dataTable = "./data/LifeExpectancyData_clean.csv";

var margin = { top: 20, right: 30, bottom: 30, left: 60 },
  width = 1250 - margin.left - margin.right,
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

var clicked = false;

function update(selectedAttribute, bool) {
  console.log(bool);
  if (bool === true) {
    // Group Countries
    d3.dsv(";", dataTable).then(function (data) {
      let aggregatedData = d3.group(
        data,
        (d) => d.Year,
        (d) => d.Country
      );

      console.log("agg", aggregatedData);

      let selectedAttribute = d3
        .selectAll('input[name="radio"]:checked')
        .node().value;

      let test = Array.from(aggregatedData).map((obj) => {
        return {
          year: new String(obj[0]),
          countries: Object.assign(
            {},
            ...Array.from(obj[1]).map((b) => {
              return isNaN(+b[1][0][selectedAttribute])
                ? { [b[0]]: 0 }
                : { [b[0]]: +b[1][0][selectedAttribute] };
            })
          ),
        };
      });

      console.log("test", test);
      const listOfYears = data.map((d) => d.Year);
      uniqueListOfYears = [...new Set(listOfYears)];

      // Add X axis
      const x = d3
        .scaleLinear()
        .domain(
          d3.extent(test, function (d) {
            return d.year;
          })
        )
        .range([0, width]);
      svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(
          d3
            .axisBottom(x)
            .tickSize(-height)
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

      // Add Y axis
      const y = d3.scaleLinear().domain([-450000, 450000]).range([0, height]);

      const countries = [...new Set(data.map((d) => d.Country))];

      //stack the data?
      const stackedData = d3
        .stack()
        .keys(countries)
        .value((obj, key) => {
          //console.log("c", obj.countries[key]);
          return obj.countries[key] === undefined ? 0 : obj.countries[key];
        })
        .offset(d3.stackOffsetSilhouette)
        .order(d3.stackOrderInsideOut);

      let stacked = stackedData(test);

      console.log("staked", stacked);

      // create a tooltip
      const Tooltip = svg
        .append("text")
        .attr("x", 500)
        .attr("y", 0)
        .style("fill", "#3a64fa")
        .style("opacity", 0)
        .style("font-family", "Telegraf-Regular")
        .style("letter-spacing", "0.05em")
        .style("font-size", 17);

      // Three function that change the tooltip when user hover / move / leave a cell
      const mouseover = function (event, d) {
        Tooltip.style("opacity", 1);
        d3.selectAll(".myArea").style("opacity", 0.2);
        d3.select(this).style("stroke", "black").style("opacity", 1);
      };
      const mousemove = function (event, d, i) {
        grp = d.key;
        Tooltip.text(grp);
      };
      const mouseleave = function (event, d) {
        Tooltip.style("opacity", 0);
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none");
      };

      // Show text attribute for visualization
      let showAttribute = svg
        .append("text")
        .attr("x", 900)
        .attr("y", 0)
        .style("fill", "#141414")
        .style("opacity", 1)
        .style("font-family", "Telegraf-Regular")
        .style("letter-spacing", "0.05em")
        .style("font-size", 17);

      showAttribute.text(selectedAttribute);

      // Area generator
      const area = d3
        .area()
        .x(function (d) {
          return x(d.data.year);
        })
        .y0(function (d) {
          return y(d[0]);
        })
        .y1(function (d) {
          return y(d[1]);
        })
        .curve(d3.curveBasis);
      // Show the areas
      svg
        .selectAll("mylayers")
        .data(stacked)
        .join("path")
        .attr("class", "myArea")
        .style("fill", "#3A64FA")
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", update());
    });

    console.log(selectedAttribute);
  }
  bool = false;
}
