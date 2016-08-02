function mergeSeriesData(){
    var data = JSON.parse('[]');
    prescriptionSeries.data.forEach(function(d){
        data.push(d);
    });
    eeagSeries.data.forEach(function(d){
        data.push(d);
    });
    hdrsSeries.data.forEach(function(d){
        data.push(d);
    });
    ymrsSeries.data.forEach(function(d){
        data.push(d);
    });
    panssPosSeries.data.forEach(function(d){
        data.push(d);
    });
    panssNegSeries.data.forEach(function(d){
        data.push(d);
    });
    panssGenSeries.data.forEach(function(d){
        data.push(d);
    });
    return data;
}

function loadPrescriptionDataset(dataset){
    if(dataset === undefined){
        prescriptionSeries.data = [];
    }
	else{
        prescriptionSeries.data = dataset.filter(function(d){
            return (d.type == 'litio' ||
                    d.type == 'antiepileptico' ||
                    d.type == 'antipsicotico' ||
                    d.type == 'ansioliticos/hipnoticos' ||
                    d.type == 'antidepresivos' ||
                    d.type == 'otros');
        });
    }
}

function loadRecordsDataset(dataset){
    if(dataset === undefined){
        eeagSeries.data = [];
        hdrsSeries.data = [];
        ymrsSeries.data = [];
        panssPosSeries.data = [];
        panssNegSeries.data = [];
        panssGenSeries.data = [];
    }
    else{
        eeagSeries.data = dataset.filter(function(d){
            return d.type == 'eeag';
        });
        hdrsSeries.data = dataset.filter(function(d){
            return d.type == 'hdrs';
        });
        ymrsSeries.data = dataset.filter(function(d){
            return d.type == 'ymrs';
        });
        panssPosSeries.data = dataset.filter(function(d){
            return d.type == 'panss_pos';
        });
        panssNegSeries.data = dataset.filter(function(d){
            return d.type == 'panss_neg';
        });
        panssGenSeries.data = dataset.filter(function(d){
            return d.type == 'panss_gen';
        });
    }
}

function afterFirstDraw(){
    // This is a critical step.  By doing this we orphan the legend. This
    // means it will not respond to graph updates.  Without this the legend
    // will redraw when the chart refreshes removing the unchecked item and
    // also dropping the events we define below.
    myChart.legends = [];

    // This block simply adds the legend title. I put it into a d3 data
    // object to split it onto 2 lines.  This technique works with any
    // number of lines, it isn't dimple specific.
    /*
    svg.selectAll("title_text")
      .data(["Click legend to","show/hide series:"])
      .enter()
      .append("text")
        .attr("x", 640)
        .attr("y", function (d, i) { return 10 + i * 14; })
        .style("font-family", "sans-serif")
        .style("font-size", "10px")
        .style("color", "Black")
        .text(function (d) { return d; });
    */

    var data = mergeSeriesData();

    // Get a unique list of Owner values to use when filtering
    var filterValues = dimple.getUniqueValues(data, "type");
    // Get all the rectangles from our now orphaned legend
    myLegend.shapes.selectAll("rect")
      // Add a click event to each rectangle
      .on("click", function (e) {
        // This indicates whether the item is already visible or not
        var hide = false;
        var newFilters = [];
        // If the filters contain the clicked shape hide it
        filterValues.forEach(function (f) {
          if (f === e.aggField.slice(-1)[0]) {
            hide = true;
          } else {
            newFilters.push(f);
          }
        });
        // Hide the shape or show it
        if (hide) {
          d3.select(this).style("opacity", 0.2);
        } else {
          newFilters.push(e.aggField.slice(-1)[0]);
          d3.select(this).style("opacity", 0.8);
        }
        // Update the filters
        filterValues = newFilters;
        // Filter the data
        var dataset = dimple.filterData(data, "type", filterValues);
        loadPrescriptionDataset(dataset, false);
        loadRecordsDataset(dataset, false);
        // Passing a duration parameter makes the chart animate. Without
        // it there is no transition
        myChart.draw(1000);
    });
}

function initChart(){
    myChart = new dimple.chart(svg, null);
    myChart.setBounds(60, 30, '75%', '80%');
    xAxis = myChart.addTimeAxis("x", "date", "%Y-%m-%d", "%d/%m/%Y");
    xAxis.addOrderRule("date");
    xAxis.title = "Fecha";

    // Axes
    prescriptionAxis = myChart.addMeasureAxis("y", "count");
    eeagAxis = myChart.addMeasureAxis("y", "value");
    hdrsAxis = myChart.addMeasureAxis(eeagAxis, "value");
    ymrsAxis = myChart.addMeasureAxis(eeagAxis, "value");
    panssGenAxis = myChart.addMeasureAxis(eeagAxis, "value");
    panssPosAxis = myChart.addMeasureAxis(eeagAxis, "value");
    panssNegAxis = myChart.addMeasureAxis(eeagAxis, "value");

    prescriptionAxis.title = "Cantidad";
    eeagAxis.title = "Puntuación";

    // Series
    prescriptionSeries = myChart.addSeries("type", dimple.plot.area, [xAxis,prescriptionAxis]);
    eeagSeries = myChart.addSeries("EEAG", dimple.plot.line, [xAxis,eeagAxis]);
    hdrsSeries = myChart.addSeries("HDRS", dimple.plot.line, [xAxis,hdrsAxis]);
    ymrsSeries = myChart.addSeries("YMRS", dimple.plot.line, [xAxis,ymrsAxis]);
    panssPosSeries = myChart.addSeries("PANSS POS", dimple.plot.line, [xAxis,panssPosAxis]);
    panssNegSeries = myChart.addSeries("PANSS NEG", dimple.plot.line, [xAxis,panssNegAxis]);
    panssGenSeries = myChart.addSeries("PANSS GEN", dimple.plot.line, [xAxis,panssGenAxis]);
    
    myLegend = myChart.addLegend('80%', 20, '20%', '50%', "right");
}

function deleteChart(){
    try{
        myChart.legends.pop();
        myLegend.shapes.remove();
        myChart.series.forEach(function(series){
            series.data = undefined;
            series.shapes.remove();
        });
    }
    catch(e){}
    finally{
        myChart.svg.selectAll('*').remove();
    }
}

function drawChart(yetDrawed){
    myChart.draw(1500);
    afterFirstDraw();
}


var svg = dimple.newSvg("#chartContainer", '100%', 400);
var myChart = new dimple.chart(svg, null);
myChart.setBounds(60, 30, '75%', '75%');
var xAxis = myChart.addTimeAxis("x", "date", "%Y-%m-%d", "%d/%m/%Y");
xAxis.addOrderRule("date");
xAxis.title = "Fecha";

// Axes
var prescriptionAxis = myChart.addMeasureAxis("y", "count");
var eeagAxis = myChart.addMeasureAxis("y", "value");
var hdrsAxis = myChart.addMeasureAxis(eeagAxis, "value");
var ymrsAxis = myChart.addMeasureAxis(eeagAxis, "value");
var panssGenAxis = myChart.addMeasureAxis(eeagAxis, "value");
var panssPosAxis = myChart.addMeasureAxis(eeagAxis, "value");
var panssNegAxis = myChart.addMeasureAxis(eeagAxis, "value");

prescriptionAxis.title = "Cantidad";
eeagAxis.title = "Puntuación";

// Series
var prescriptionSeries = myChart.addSeries("type", dimple.plot.area, [xAxis,prescriptionAxis]);
var eeagSeries = myChart.addSeries("EEAG", dimple.plot.line, [xAxis,eeagAxis]);
var hdrsSeries = myChart.addSeries("HDRS", dimple.plot.line, [xAxis,hdrsAxis]);
var ymrsSeries = myChart.addSeries("YMRS", dimple.plot.line, [xAxis,ymrsAxis]);
var panssPosSeries = myChart.addSeries("PANSS POS", dimple.plot.line, [xAxis,panssPosAxis]);
var panssNegSeries = myChart.addSeries("PANSS NEG", dimple.plot.line, [xAxis,panssNegAxis]);
var panssGenSeries = myChart.addSeries("PANSS GEN", dimple.plot.line, [xAxis,panssGenAxis]);

var myLegend =  myChart.addLegend('80%', 20, '20%', '50%', "right");




