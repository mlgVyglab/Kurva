

// function drawHexView(){

//   //d3 canvases for svg elements
//   hexArea = d3.select("#hex_div").append("svg")
//                                     .attr("width",400)
//                                     .attr("height",400);

//   // hexArea.append('circle')
//   //  .attr("cx",10)
//   //  .attr("cy",155)
//   //  .attr("r",60)
//   //  .attr('fill','red')
//   //  // .attr('opacity',1)
//   //  .attr('stroke', 'black')
//   //  .attr('stroke-width', '1px');


var d3Hexbin = require("d3-hexbin")

chart = {
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  svg.append("g")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.1)
    .selectAll("path")
    .data(bins)
    .join("path")
      .attr("d", hexbin.hexagon())
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("fill", d => color(d.length));

  return svg.node();
}

// }

var printError = function(error, explicit) {
    console.log(`[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}`);
}

//array of x and y positions just for hexbins
var binData = [];
var hexbin = d3.hexbin();

var margin = ({top: 20, right: 20, bottom: 30, left: 40})
var height = 871

var x = d3.scaleLog()
    .domain(d3.extent(data, d => d.x))
    .range([margin.left, width - margin.right])

var y = d3.scaleLog()
    .domain(d3.extent(data, d => d.y))
    .rangeRound([height - margin.bottom, margin.top])

var color = d3.scaleSequential(d3.interpolateBuPu)
    .domain([0, d3.max(bins, d => d.length) / 2])

var hexbin = d3.hexbin()
    .x(d => x(d.x))
    .y(d => y(d.y))
    .radius(radius * width / 954)
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])

function prepareHexBinData() {

	binData = [];

	for (let n in data) {
		//last row in data is summary of columns
		if(!isNaN(n)){	
			binData.push(new Object());
		}
	}

	var i = 0;

	try {
		for (let n in data) {
			i = n;
			//last row in data is summary of columns
			if(!isNaN(n)){		
				binData[n].x = data[n].tSNE_0; 
				binData[n].y = data[n].tSNE_1;
			}
		}
	}
	catch(e) {
	  if (e instanceof TypeError) {
	  		console.log("This one is the fucker: " + i)
	        printError(e, true);
	    } else {
	    	console.log('Some other error and this fucker caused it: ' + i);
	    	printError(e, false);
	    }
	  // expected output: ReferenceError: nonExistentFunction is not defined
	  // Note - error messages will vary depending on browser
	}


}


// drawHexView();
function drawHex(){
	console.log("drawHex initiated")

	prepareHexBinData();

	bins = hexbin(binData)

	var svg = d3.select("#hex_div").append("svg").attr("width", 500).attr("height", 500).append("circle")//.attr("cx", 25).attr("cy", 25).attr("r", 25).style("fill", "purple");    

	svg.selectAll("#hex_div")
	  .data(hexbin(binData))
	  .enter().append("path")
	  .attr("d", function(d) { return "M" + d.x + "," + d.y + hexbin.hexagon(); });
	
}


// chart = {
//   const svg = d3.create("svg")
//       .attr("viewBox", [0, 0, width, height]);

//   svg.append("g")
//       .call(xAxis);

//   svg.append("g")
//       .call(yAxis);

//   svg.append("g")
//       .attr("stroke", "#000")
//       .attr("stroke-opacity", 0.1)
//     .selectAll("path")
//     .data(bins)
//     .join("path")
//       .attr("d", hexbin.hexagon())
//       .attr("transform", d => `translate(${d.x},${d.y})`)
//       .attr("fill", d => color(d.length));

//   return svg.node();
// }