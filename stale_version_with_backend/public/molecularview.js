//Variables globales de mi sistema
var data;
const padding = 40;
var selectedItem = null;
var brush = d3.brush();
var brushEnabled = false;
var elemento_clickeado = false;
extent = null
var actividadesOn= false;

// Funcion de color de acuerdo al cluster
var color_cluster = d3.scaleOrdinal()
    .domain(["-1", "0", "1", "2", "3", "4", "5", "6"])
    .range([ "#666666", "#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#e41a1c", "#377eb8", "#66a61e"])

// Funcion de color de acuerdo al cluster
var nombre_cluster = d3.scaleOrdinal()
    .domain(["-1", "0", "1", "2", "3", "4", "5", "6"])
    .range([ "N/A", "Cluster 0", "Cluster 1", "Cluster 2", "Cluster 3", "Cluster 4", "Cluster 5", "Cluster 6"])

// Funcion de color de acuerdo a la bioactividad
var color_activity = d3.scaleOrdinal()
    .domain(["RB", "NRB"])
    .range([ "#177D03", "#FF1414"])

//D3.js canvases
var titleArea;
var contextArea;
var plotArea;
var detailsArea;
var moleculeArea;
var tagsArea;
var moleculeArea3D;

var gameInstance;

/*Loading data from CSV file and editing the properties to province codes. 
Unary operator plus is used to save the data as numbers (originally imported as string)*/
d3.csv("./public/rb_dataset.csv")
    .row(function(d) { return {
      ID : d.ID,
      SMILES : d.SMILES,
      tSNE_0 : +d.tSNE_0,
      tSNE_1 : +d.tSNE_1,
      LogP : +d.LogP,
      Mol_Weight : +d.Mol_Weight,
      Heavy_Atom_Count : +d.Heavy_Atom_Count,
      Aromatic_Rings : +d.Aromatic_Rings,
      Rotatable_Bonds : +d.Rotatable_Bonds,
      Cluster : +d.Cluster,
      Bioactivity : d.Bioactivity
    }; 
  }).get(function(error, rows) { 
      //saving reference to data
      data = rows;

      //load map and initialise the views
      init();

      // data visualization
      visualization();
  });


/*----------------------
INITIALIZE VISUALIZATION
----------------------*/
function init() {

  let width = screen.width;
  let height = screen.height;
  

  //d3 canvases for svg elements
  titleArea = d3.select("#title_div").append("svg")
                                    .attr("width",d3.select("#title_div").node().clientWidth)
                                    .attr("height",d3.select("#title_div").node().clientHeight);

  contextArea = d3.select("#context_div").append("svg")
                                    .attr("width",d3.select("#context_div").node().clientWidth)
                                    .attr("height",d3.select("#context_div").node().clientHeight);

  plotArea = d3.select("#plot_div").append("svg")
                                    .attr("width",d3.select("#plot_div").node().clientWidth)
                                    .attr("height",d3.select("#plot_div").node().clientHeight);

  detailsArea = d3.select("#details_div").append("table")
                                    .attr("width",d3.select("#details_div").node().clientWidth)
                                    .attr("height",d3.select("#details_div").node().clientHeight);   

  moleculeArea = d3.select("#molecule_div").append("svg")
                                    .attr("width",d3.select("#molecule_div").node().clientWidth)
                                    .attr("height",d3.select("#molecule_div").node().clientHeight);  

  moleculeArea3D  = d3.select("#molecule3D_div").append("svg")
                                    .attr("width",d3.select("#molecule3D_div").node().clientWidth)
                                    .attr("height",d3.select("#molecule3D_div").node().clientHeight);
  tagsArea = d3.select("#tags_div").append("svg")
                                    .attr("width",d3.select("#tags_div").node().clientWidth)
                                    .attr("height",d3.select("#tags_div").node().clientHeight);  

  d3.selectAll("[name=checkbox]").checked = false;
}

/*----------------------
BEGINNING OF VISUALIZATION
----------------------*/
function visualization() {

  drawTitle();

  drawContext();

  drawPlot();

  drawDetails(data);

  drawTags();
  
  drawMolecule3D();
  

}
/*----------------------
Title
----------------------*/
function drawTitle(){
  //Draw headline
  titleArea.append("text")
         .attrs({dx: 20, dy: "1em", class: "h4"})
         .text("MolEViTA - Ready Biodegradability");


 //titleArea.append("text")
//         .attrs({dx: 180 , dy: "1em", class: "subline"})
//         .text(" - Ready Biodegradability");
}




/*----------------------
Context
----------------------*/
function drawContext(){

  contextArea.remove();

  contextArea = d3.select("#context_div").append("svg")
                                    .attr("width",d3.select("#context_div").node().clientWidth)
                                    .attr("height",d3.select("#context_div").node().clientHeight);

  let thisCanvasWidth = d3.select("#context_div").node().clientWidth;
  let thisCanvasHeight = d3.select("#context_div").node().clientHeight;

  if (thisCanvasHeight> thisCanvasWidth)
    thisCanvasHeight=thisCanvasWidth
    
  else thisCanvasWidth=thisCanvasHeight;

  contextArea.append('rect')
            .attrs({ x: 0, y: 20, width: thisCanvasWidth-60, height: thisCanvasHeight - 30, fill: '#c3c3c3' })

  ScatterPlot_context(thisCanvasWidth, thisCanvasHeight, data);
  
}

/*----------------------
Main Plot
----------------------*/
function drawPlot(){

  resetPlot();
}

/*----------------------
Details
----------------------*/
function drawDetails(visibleData){

	detailsArea.remove()

	detailsArea = d3.select("#details_div").append("table")
                                    .attr("width",d3.select("#details_div").node().clientWidth)
                                    .attr("height",d3.select("#details_div").node().clientHeight);

  var allData, currentData, startPos = 0, increment = 10;

    thead = detailsArea.append("thead").attr('class', 'fixedHeader')
    tbody = detailsArea.append("tbody").attr('class', 'scrollContent')

    allData  = visibleData;

    columnas = [data.columns[1],data.columns[4],data.columns[5],data.columns[6],data.columns[7],data.columns[8],data.columns[9],data.columns[10]]

    var sortAscending = true;
    headers = thead.append('tr')
      .selectAll('th')
      .data(columnas).enter()
      .append('th').attr('class',function(header){
        if (header=='SMILES'){
          return 'th_SMILES'
        }
        else{
          return 'th_otros'
        }
      })
      .text(function (d) {
      return d;
    }).style('color', 'black')
      .on('click', function (d) {
          if (sortAscending) {
            rows.sort(function(a, b) { return b[d] < a[d]; });
            sortAscending = false;
          } 
            else {
            rows.sort(function(a, b) { return b[d] > a[d]; });
            sortAscending = true;
          }
                         
      });

    tbody.selectAll('tr').remove();

    // Create new rows.
    var rows = tbody.selectAll("tr")
                  .data(allData).enter()
                  .append("tr")
                  // .classed("even", function(d, i) {
                  //   return i % 2 == 1; 
                  // })
                  .on("mouseover", function(d){
                    d3.select(this)
                    .style("background-color", "white");
                    if (!elemento_clickeado){
                      selectedItem = d;
                      // ScatterPlot_plot(x_izquierdo, x_derecho, y_abajo, y_arriba, data.filter(v => isBrushed(extent, escala_x_contexto(v.tSNE_0), escala_y_contexto(v.tSNE_1))))
                      puntos_plot.styles({'fill': d => actividadesOn ? color_activity(d.Bioactivity) : color_cluster(d.Cluster),
                              'opacity': d =>  (d == selectedItem || selectedItem == null) ? 1 : 0.3,
                              'stroke': d =>  (d == selectedItem || selectedItem == null) ? 'black' : 'transparent'});
                      }})
                  .on("mouseout", function(d){
                    d3.select(this)
                    .style("background-color","transparent");
                    if(!elemento_clickeado){
                      selectedItem = null;
                      // ScatterPlot_plot(x_izquierdo, x_derecho, y_abajo, y_arriba, data.filter(v => isBrushed(extent, escala_x_contexto(v.tSNE_0), escala_y_contexto(v.tSNE_1))))
                      puntos_plot.styles({'fill': d => actividadesOn ? color_activity(d.Bioactivity) : color_cluster(d.Cluster),
                              'opacity': d =>  (d == selectedItem || selectedItem == null) ? 1 : 0.3,
                              'stroke': d =>  (d == selectedItem || selectedItem == null) ? 'black' : 'transparent'});
                      }
                  });

    var cells = rows.selectAll('td')
          .data(function (row) { 
            return columnas.map(function (column) {
              return { 
                column: column,
                value: row[column]
              }
            });
          }).enter()
          .append('td').attr('class',function(d){
            if (d.column=='SMILES'){
              return 'td_SMILES'
            }
            else{
              return 'td_otros'
            }
          }).text(function (d) {
            if (d.column=='Cluster'){
              return nombre_cluster(d.value); 
            }
            else
              return d.value;
          }).style('color',function (d) { 
                    if (d.column=='Cluster'){
                      return color_cluster(d.value);
                    }
                    else if (d.column=='Bioactivity'){
                      return color_activity(d.value);
                    }
                    else return 'black';});
  // }
}

function drawTags(){

  tagsArea.remove();
  tagsArea = d3.select("#tags_div").append("svg")
                                    .attr("width",d3.select("#tags_div").node().clientWidth)
                                    .attr("height",d3.select("#tags_div").node().clientHeight)

  
  d3.selectAll("[name=checkbox]").on("change", function() {
    actividadesOn = this.checked;
    drawTags();
    // ScatterPlot_plot(x_izquierdo, x_derecho, y_abajo, y_arriba, data.filter(v => isBrushed(extent, escala_x_contexto(v.tSNE_0), escala_y_contexto(v.tSNE_1))));
    puntos_context.style('fill',function(d) {
        if(actividadesOn)
          return color_activity(d.Bioactivity)
        else
          return color_cluster(d.Cluster)});
    puntos_plot.style('fill',function(d) {
        if(actividadesOn)
          return color_activity(d.Bioactivity)
        else
          return color_cluster(d.Cluster)});


    });
       

    
  if (!actividadesOn){
    i = 0;
    for (elem in nombre_cluster.domain()){
      i=i+1;
      tagsArea.append('circle')
      .attr("cx",10)
      .attr("cy",15*i)
      .attr("r",6)
      .attr('fill',function(d){
        return color_cluster(nombre_cluster.domain()[elem])
      })
      .attr('opacity',1)
      .attr('stroke', 'black')
      .attr('stroke-width', '1px');

      tagsArea.append('text')
      .attrs({dx: 20, dy: 15*i +5, class: 'simple_text'})
      .text(function(){return nombre_cluster.range()[elem];});
      }
    }

    else{
      i = 0;
      for (elem in color_activity.domain()){
        i=i+1;
        tagsArea.append('circle')
        .attr("cx",10)
        .attr("cy",15*i)
        .attr("r",6)
        .attr('fill',function(d){
          return color_activity.range()[elem]
        })
        .attr('opacity',1)
        .attr('stroke', 'black')
        .attr('stroke-width', '1px');

        tagsArea.append('text')
        .attrs({dx: 20, dy: 15*i +5, class: 'simple_text'})
        .text(function(){return color_activity.domain()[elem];});
        }
    }
    
}

/*----------------------
Auxiliary functions
----------------------*/
function ScatterPlot_context(w, h, visibleData){

  escala_x_contexto = getXScale_context(w,h);
  escala_y_contexto = getyScale_context(w,h);
  //console.log("escala x contexto " + escala_x_contexto);
  //console.log("escala y contexto " + escala_y_contexto);
  // Dibujo los ejes 
  var xAxis = d3.axisBottom().scale(escala_x_contexto).ticks(5);
    
  var yAxis = d3.axisLeft().scale(escala_y_contexto).ticks(5);

  // Ploteo los puntitos
  puntos_context = contextArea.selectAll("circle")
      .data(visibleData.filter(v => v!=null))
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return escala_x_contexto(d.tSNE_0);
      })
      .attr("cy", function(d) {
        return escala_y_contexto(d.tSNE_1);
      })
      .attr("r", 5)
      .attr('fill',function(d) {
        if(actividadesOn)
          return color_activity(d.Bioactivity)
        else
          return color_cluster(d.Cluster)})
      .style("opacity", 0.3);

  // Brushing
  region = contextArea.call(d3.brush()
        .extent( [ [padding,20], [w-60,h-padding] ])
        .on("start brush", updateChart) 
  )

  //console.log(region);

// Actualizo las vistas de acuerdo al brushing
  function updateChart() {
    // Get the selection coordinate
    extent = d3.event.selection;

    escala_x_contexto = getXScale_context(w,h);
    escala_y_contexto = getyScale_context(w,h);
    contextArea.selectAll('circle').classed("selected_points", function(d){ return isBrushed(extent, escala_x_contexto(d.tSNE_0), escala_y_contexto(d.tSNE_1))});
    
    if(extent == null){
      // Obtengo los limites del brushing
      x_izquierdo = d3.min(data, function(d) { return d.tSNE_0; }); 
      x_derecho = d3.max(data, function(d) { return d.tSNE_0; });
      y_abajo= d3.min(data, function(d) { return d.tSNE_1; }); 
      y_arriba= d3.max(data, function(d) { return d.tSNE_1; });
    }
    else{
      // Obtengo los limites del brushing
      x_izquierdo = extent[0][0];
      x_derecho = extent[1][0];
      y_abajo= extent[1][1];
      y_arriba= extent[0][1];

      x_izquierdo = escala_x_contexto.invert(x_izquierdo);
      x_derecho = escala_x_contexto.invert(x_derecho);
      y_abajo = escala_y_contexto.invert(y_abajo);
      y_arriba = escala_y_contexto.invert(y_arriba);
    }
    

    ScatterPlot_plot(x_izquierdo, x_derecho, y_abajo, y_arriba, data.filter(v => isBrushed(extent, escala_x_contexto(v.tSNE_0), escala_y_contexto(v.tSNE_1))));
  
    drawDetails(data.filter(v => isBrushed(extent, escala_x_contexto(v.tSNE_0), escala_y_contexto(v.tSNE_1))));
  }
      
  //x axis
  contextArea.append("g")
      .attr("class", "x axis")  
      .attr("transform", "translate(0," + (h - padding) + ")")
      .call(xAxis);

  
  //y axis
  contextArea.append("g")
      .attr("class", "y axis")  
      .attr("transform", "translate(" + padding + ", 0)")
      .call(yAxis);
  
  // contextArea.append('text').attrs({'x':(w - 2*padding),'y': (h - 0.5*padding), 'class':'simple_text'}).text('t-SNE 0');
 
  // contextArea.append('text').attrs({'x':(0),'y': (padding +10), 'class':'simple_text'}).text('t-SNE 1');

  
  contextArea.on('click',resetPlot);
}


function ScatterPlot_plot(x_izquierdo, x_derecho, y_abajo, y_arriba, visibleData){

  let thisCanvasWidth = d3.select("#plot_div").node().clientWidth;
  let thisCanvasHeight = d3.select("#plot_div").node().clientHeight;

  // Actualizo plot
  // Determino margenes de lo brusheado y lo guardo en clip

  plotArea.remove();
  plotArea = d3.select("#plot_div").append("svg")
                                    .attr("width",d3.select("#plot_div").node().clientWidth)
                                    .attr("height",d3.select("#plot_div").node().clientHeight);
  if(extent == null){
      // Obtengo los limites del brushing
      x_izquierdo = d3.min(data, function(d) { return d.tSNE_0; }); 
      x_derecho = d3.max(data, function(d) { return d.tSNE_0; });
      y_abajo= d3.min(data, function(d) { return d.tSNE_1; }); 
      y_arriba= d3.max(data, function(d) { return d.tSNE_1; });

  }

  // Primero dibujo los ejes
  var xScale = d3.scaleLinear()
      .domain([x_izquierdo, x_derecho])
      .range([padding, thisCanvasWidth - padding * 2]);
      
  var yScale = d3.scaleLinear()
      .domain([y_abajo, y_arriba])
      .range([thisCanvasHeight - padding, padding]);
    
  var xAxis = d3.axisBottom().scale(xScale).ticks(5);
    
  var yAxis = d3.axisLeft().scale(yScale).ticks(5);
  puntos_plot = plotArea.selectAll("circle")
      .data(visibleData.filter(v => v!=null))
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return xScale(d.tSNE_0);
      })
      .attr("cy", function(d) {
        return yScale(d.tSNE_1);
      })
      .attr("r", function(d){
        if (extent == null)
          return 5
        else
          return 7
      })
      .attr('fill',function(d) {
        if(actividadesOn)
          return color_activity(d.Bioactivity)
        else
          return color_cluster(d.Cluster)})
      .attr('opacity',function(d){
        if (d == selectedItem || selectedItem == null)
          return 1
        else
          return 0.3
      })
      .attr('stroke', function(d){
        if (d == selectedItem || selectedItem == null)
          return 'black'
        else
          return 'transparent'
      })
      .attr('stroke-width', '1px')
      .on('mouseover', function(d){
        if (!elemento_clickeado){
          selectedItem = d;
          // ScatterPlot_plot(x_izquierdo, x_derecho, y_abajo, y_arriba, data.filter(v => isBrushed(extent, escala_x_contexto(v.tSNE_0), escala_y_contexto(v.tSNE_1))))
          puntos_plot.styles({'fill': d => actividadesOn ? color_activity(d.Bioactivity) : color_cluster(d.Cluster),
                              'opacity': d =>  (d == selectedItem || selectedItem == null) ? 1 : 0.3,
                              'stroke': d =>  (d == selectedItem || selectedItem == null) ? 'black' : 'transparent'});
          drawDetails([d]);
        }
        
      })
      .on('mouseout', function(d){
        if (!elemento_clickeado){
          selectedItem = null;
          // ScatterPlot_plot(x_izquierdo, x_derecho, y_abajo, y_arriba, data.filter(v => isBrushed(extent, escala_x_contexto(v.tSNE_0), escala_y_contexto(v.tSNE_1))))
          puntos_plot.styles({'fill': d => actividadesOn ? color_activity(d.Bioactivity) : color_cluster(d.Cluster),
                              'opacity': d =>  (d == selectedItem || selectedItem == null) ? 1 : 0.3,
                              'stroke': d =>  (d == selectedItem || selectedItem == null) ? 'black' : 'transparent'});
          drawDetails(visibleData);
        }
      })
      .on('click', function(d){
        elemento_clickeado = true;
        selectedItem = d;
        // ScatterPlot_plot(x_izquierdo, x_derecho, y_abajo, y_arriba, data.filter(v => isBrushed(extent, escala_x_contexto(v.tSNE_0), escala_y_contexto(v.tSNE_1))))
        puntos_plot.styles({'fill': d => actividadesOn ? color_activity(d.Bioactivity) : color_cluster(d.Cluster),
                              'opacity': d =>  (d == selectedItem || selectedItem == null) ? 1 : 0.3,
                              'stroke': d =>  (d == selectedItem || selectedItem == null) ? 'black' : 'transparent'});
        drawDetails([d]);
        cargarImagen(d);
		//cargarJSMol3D(d);
		
      });
      
  //x axis
  plotArea.append("g")
      .attr("class", "x axis")  
      .attr("transform", "translate(0," + (thisCanvasHeight - padding) + ")")
      .call(xAxis);

  plotArea.append('text').attrs({'x':(thisCanvasWidth - 2*padding),'y': (thisCanvasHeight - 0.5*padding), 'class':'simple_text'}).text('t-SNE 0');
    
   //y axis
  plotArea.append("g")
      .attr("class", "y axis")  
      .attr("transform", "translate(" + padding + ", 0)")
      .call(yAxis);

  plotArea.append('text').attrs({'x':(0),'y': (padding -10), 'class':'simple_text'}).text('t-SNE 1');
 

  plotArea.on('contextmenu', function(){
    d3.event.preventDefault();
    elemento_clickeado = false;
    selectedItem = null;
    // ScatterPlot_plot(x_izquierdo, x_derecho, y_abajo, y_arriba, data.filter(v => isBrushed(extent, escala_x_contexto(v.tSNE_0), escala_y_contexto(v.tSNE_1))))
    puntos_plot.styles({'fill': d => actividadesOn ? color_activity(d.Bioactivity) : color_cluster(d.Cluster),
                        'opacity': d =>  (d == selectedItem || selectedItem == null) ? 1 : 0.3,
                        'stroke': d =>  (d == selectedItem || selectedItem == null) ? 'black' : 'transparent'});
    drawDetails(visibleData);
    moleculeArea.remove();
  })

}


function resetPlot(){
    plotArea.remove();
    plotArea = d3.select("#plot_div").append("svg")
                                    .attr("width",d3.select("#plot_div").node().clientWidth)
                                    .attr("height",d3.select("#plot_div").node().clientHeight);

    // Obtengo los limites del brushing
    x_izquierdo = 4;
    x_derecho = d3.max(data, function(d) { return d.tSNE_0; });
    y_abajo= 0;
    y_arriba= d3.max(data, function(d) { return d.tSNE_1; })
    
    extent = null
    elemento_clickeado = false;
    selectedItem = null;
    moleculeArea.remove();
    ScatterPlot_plot(x_izquierdo, x_derecho, y_abajo, y_arriba, data);
    drawDetails(data);

}

function getXScale_context(w,h){
  // Defino funciones de escalado de los datos
  var xScale = d3.scaleLinear()
      .domain([d3.min(data, function(d) { return d.tSNE_0; }), d3.max(data, function(d) { return d.tSNE_0; })])
      .range([padding, w - padding * 2]);
      
  return xScale;
}


function getyScale_context(w,h){
  // Defino funciones de escalado de los datos
  var yScale = d3.scaleLinear()
      .domain([d3.min(data, function(d) { return d.tSNE_1; }),d3.max(data, function(d) { return d.tSNE_1; })])
      .range([h - padding, padding]);
      
  return yScale;
}
  
function isBrushed(brush_coords, cx, cy) {
      if (brush_coords == null)
        return true
      else{
        var x0 = brush_coords[0][0],
           x1 = brush_coords[1][0],
           y0 = brush_coords[0][1],
           y1 = brush_coords[1][1];
      return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; 
      }
}

function cargarImagen(molecula){
  id = molecula.ID;
  moleculeArea.remove();
  moleculeArea = d3.select("#molecule_div").append("svg")
                                    .attr("width",d3.select("#molecule_div").node().clientWidth)
                                    .attr("height",d3.select("#molecule_div").node().clientHeight);

  moleculeArea.append('rect')
    .attr('width', 130)
    .attr('height', 130)
    .attr('x', 0)
    .attr('y', 0)
    .attr('fill','#c3c3c3');

  var myimage = moleculeArea.append('image')
    .attr("xlink:href", "images/"+id+".png")
    .attr('width', 130)
    .attr('height', 130)
    .attr('x', 0)
    .attr('y', 0);

}


function drawMolecule3D(){
  gameInstance = UnityLoader.instantiate("molecule3D_div", "Build/WebGL.json", {onProgress: UnityProgress});

}


function rotate(){
    var x = "\\n     RDKit          3D\\n\\n 12 12  0  0  0  0  0  0  0  0999 V2000\\n    0.7943   -1.1490    0.0150 C   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.3607    0.1298   -0.0022 C   0  0  0  0  0  0  0  0  0  0  0  0\\n    0.5898    1.2681   -0.0170 C   0  0  0  0  0  0  0  0  0  0  0  0\\n   -0.7866    1.1450   -0.0149 C   0  0  0  0  0  0  0  0  0  0  0  0\\n   -1.3413   -0.1124    0.0019 C   0  0  0  0  0  0  0  0  0  0  0  0\\n   -0.5806   -1.2656    0.0170 C   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.4026   -2.0428    0.0267 H   0  0  0  0  0  0  0  0  0  0  0  0\\n    2.4183    0.2113   -0.0036 H   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.0075    2.2686   -0.0304 H   0  0  0  0  0  0  0  0  0  0  0  0\\n   -1.4182    2.0293   -0.0265 H   0  0  0  0  0  0  0  0  0  0  0  0\\n   -2.4222   -0.2172    0.0037 H   0  0  0  0  0  0  0  0  0  0  0  0\\n   -1.0241   -2.2652    0.0304 H   0  0  0  0  0  0  0  0  0  0  0  0\\n  1  2  2  0\\n  2  3  1  0\\n  3  4  2  0\\n  4  5  1  0\\n  5  6  2  0\\n  6  1  1  0\\n  1  7  1  0\\n  2  8  1  0\\n  3  9  1  0\\n  4 10  1  0\\n  5 11  1  0\\n  6 12  1  0\\nM  END\\n$$$$\\n     RDKit          3D\\n\\n 17 17  0  0  0  0  0  0  0  0999 V2000\\n   -3.0233    2.1011   -0.0269 C   0  0  0  0  0  0  0  0  0  0  0  0\\n   -1.6334    2.2426   -0.0292 O   0  0  0  0  0  0  0  0  0  0  0  0\\n   -0.7857    1.1478   -0.0150 C   0  0  0  0  0  0  0  0  0  0  0  0\\n   -1.3432   -0.1139    0.0019 C   0  0  0  0  0  0  0  0  0  0  0  0\\n    0.5873    1.2648   -0.0170 C   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.3579    0.1217   -0.0021 C   0  0  0  0  0  0  0  0  0  0  0  0\\n    0.8013   -1.1406    0.0149 C   0  0  0  0  0  0  0  0  0  0  0  0\\n   -0.5821   -1.2654    0.0170 C   0  0  0  0  0  0  0  0  0  0  0  0\\n   -1.2125   -2.5728    0.0346 C   0  0  0  0  0  0  0  0  0  0  0  0\\n   -1.7036   -3.6219    0.0505 N   0  0  0  0  0  0  0  0  0  0  0  0\\n   -3.3439    1.4334   -0.8465 H   0  0  0  0  0  0  0  0  0  0  0  0\\n   -3.3765    1.6558    0.9366 H   0  0  0  0  0  0  0  0  0  0  0  0\\n   -3.4818    3.1063   -0.0846 H   0  0  0  0  0  0  0  0  0  0  0  0\\n   -2.4429   -0.1905    0.0033 H   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.0009    2.2567   -0.0303 H   0  0  0  0  0  0  0  0  0  0  0  0\\n    2.4528    0.2090   -0.0036 H   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.4121   -2.0396    0.0266 H   0  0  0  0  0  0  0  0  0  0  0  0\\n  1  2  1  0\\n  2  3  1  0\\n  3  4  2  0\\n  3  5  1  0\\n  5  6  2  0\\n  6  7  1  0\\n  7  8  2  0\\n  8  9  1  0\\n  9 10  3  0\\n  8  4  1  0\\n  1 11  1  0\\n  1 12  1  0\\n  1 13  1  0\\n  4 14  1  0\\n  5 15  1  0\\n  6 16  1  0\\n  7 17  1  0\\nM  END\\n$$$$\\n     RDKit          3D\\n\\n 22 22  0  0  0  0  0  0  0  0999 V2000\\n    1.1034    4.8201   -0.0643 C   0  0  0  0  0  0  0  0  0  0  0  0\\n    0.3507    3.6380   -0.0484 O   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.2533    2.5846   -0.0347 C   0  0  0  0  0  0  0  0  0  0  0  0\\n    0.5902    1.2657   -0.0170 C   0  0  0  0  0  0  0  0  0  0  0  0\\n   -0.7737    1.1487   -0.0150 C   0  0  0  0  0  0  0  0  0  0  0  0\\n   -1.3500   -0.1252    0.0021 C   0  0  0  0  0  0  0  0  0  0  0  0\\n   -2.7849   -0.2360    0.0040 C   0  0  0  0  0  0  0  0  0  0  0  0\\n   -3.3240   -1.3643    0.0192 O   0  0  0  0  0  0  0  0  0  0  0  0\\n   -0.5783   -1.2643    0.0170 C   0  0  0  0  0  0  0  0  0  0  0  0\\n    0.7900   -1.1401    0.0149 C   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.3585    0.1298   -0.0022 C   0  0  0  0  0  0  0  0  0  0  0  0\\n    2.7589    0.1836   -0.0033 O   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.7587    4.9127    0.8160 H   0  0  0  0  0  0  0  0  0  0  0  0\\n    0.4279    5.7115   -0.1730 H   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.7922    4.7635   -0.9495 H   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.8799    2.7061   -0.9628 H   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.9743    2.6854    0.8074 H   0  0  0  0  0  0  0  0  0  0  0  0\\n   -1.4401    2.0231   -0.0264 H   0  0  0  0  0  0  0  0  0  0  0  0\\n   -3.4175    0.6324   -0.0074 H   0  0  0  0  0  0  0  0  0  0  0  0\\n   -0.9970   -2.2724    0.0305 H   0  0  0  0  0  0  0  0  0  0  0  0\\n    1.4216   -1.9980    0.0261 H   0  0  0  0  0  0  0  0  0  0  0  0\\n    3.3334   -0.6459    0.0075 H   0  0  0  0  0  0  0  0  0  0  0  0\\n  1  2  1  0\\n  2  3  1  0\\n  3  4  1  0\\n  4  5  2  0\\n  5  6  1  0\\n  6  7  1  0\\n  7  8  2  0\\n  6  9  2  0\\n  9 10  1  0\\n 10 11  2  0\\n 11 12  1  0\\n 11  4  1  0\\n  1 13  1  0\\n  1 14  1  0\\n  1 15  1  0\\n  3 16  1  0\\n  3 17  1  0\\n  5 18  1  0\\n  7 19  1  0\\n  9 20  1  0\\n 10 21  1  0\\n 12 22  1  0\\nM  END\\n";
    gameInstance.SendMessage("sdfReader","interpretData",x);
}

var concatenated_smiles="";



//We will build a basic function to handle window resizing.
function resize() {
    
    drawPlot();
    drawContext();
     
}

window.onresize = resize;
