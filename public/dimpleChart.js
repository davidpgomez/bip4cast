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
        // if the clicked value is one of the test, we should change the value we push
        // because the label is distinct of the type value of the test datast
        var filterValue = e.aggField.slice(-1)[0];
        switch(filterValue){
            case 'EEAG': filterValue = 'eeag'; break;
            case 'HDRS': filterValue = 'hdrs'; break;
            case 'YMRS': filterValue = 'ymrs'; break;
            case 'PANSS POS': filterValue = 'panss_pos'; break;
            case 'PANSS NEG': filterValue = 'panss_neg'; break;
            case 'PANSS GEN': filterValue = 'panss_gen'; break;
        }
        
        // If the filters contain the clicked shape hide it
        filterValues.forEach(function (f) {
          if (f === filterValue) {
            hide = true;
          } else {  
            newFilters.push(f);
          }
        });
        // Hide the shape or show it
        if (hide) {
          d3.select(this).style("opacity", 0.2);
        } else {
          // if the value is not in the filterList and it hide, we pushed it    
          newFilters.push(filterValue);
          d3.select(this).style("opacity", 0.8);
        }
        // Update the filters
        filterValues = newFilters;
        // Filter the data
        var dataset = dimple.filterData(data, "type", filterValues);
        // Reload datasets
        loadPrescriptionDataset(dataset);
        loadRecordsDataset(dataset);
        // Passing a duration parameter makes the chart animate. Without
        // it there is no transition
        myChart.draw(1000);
    });
}

function initDistributionChart(){
    svg = dimple.newSvg("#chartContainer", '100%', 400);
    myChart = new dimple.chart(svg, null);
    myChart.setBounds(60, 30, '73%', '80%');
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
    
    myLegend = myChart.addLegend('83%', 30, '22%', '50%', "right");
}

function drawDistribution(){
    myChart.draw(1500);
    afterFirstDraw();
}

function initHistogramChart(){
    svg = dimple.newSvg("#chartContainer", '100%', 400);
    myChart = new dimple.chart(svg, null);
    myChart.setBounds(60, 30, '73%', '80%');
    xQuantityAxis = myChart.addCategoryAxis("x", "value");
    prescriptionAxis = myChart.addMeasureAxis("y", "count");
    
    prescriptionAxis.title = "Días";
    xQuantityAxis.title = "Tomas";
    
    prescriptionSeries = myChart.addSeries(null, dimple.plot.bar, [xQuantityAxis,prescriptionAxis]);
    
    myLegend = myChart.addLegend('83%', 30, '22%', '50%', "right");
}

function loadPrescriptionHistogramDataset(drug, dataset){
    if(dataset === undefined){
        prescriptionSeries.series = [];
    }
    else{
        var dates = dimple.getUniqueValues(dataset, 'date');
        var data = JSON.parse('[]');
        dates.forEach(function(i, d){
            // filter by date and drug
            var oneDayDrugs = dataset.filter(function(e){
                    return e.date == i && e.type == drug;
               });
            data.push({ value : oneDayDrugs.length, count : 1 });
        });/*
        var quantiles = dimple.getUniqueValues(data, 'value');
        var quan = [0.1, 0.2, 0.3, 0.4, 0.5,0.6,0.7,0.8,0.9,1];
        quan.forEach(function(i){
            if(!quantiles.includes(i)){
                data.push({
                    value : i,
                    count : 0
                })
            }
        });*/
        prescriptionSeries.data = data;
    }
}

function drawHistogram(){
    myChart.draw(1500);
}

function loadPrescriptionHeatmapDataset(drug, dataset){
    if(dataset === undefined){
        prescriptionSeries.series = [];
    }
    else{
        var dates = dimple.getUniqueValues(dataset, 'date');
        var data = JSON.parse('[]');
        dates.forEach(function(i, d){
            splittedDate = i.split('-');
            month = splittedDate[1];
            day = splittedDate[2];
            var oneDayDrugs = dataset.filter(function(e){
                    return e.date == i;
            });
            data.push({ month : month, day : day, value : oneDayDrugs.filter(function(e){return e.type == drug}).length});
        });
        
        return data;
    }
}

function drawHeatmap(drug, dataset){
    
        var margin = { top: 50, right: 0, bottom: 100, left: 30 },
          width = 730 - margin.left - margin.right,
          height = 450 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 31),
          legendElementWidth = gridSize*2,
          buckets = 5,
          colors = ["#081d58", "#225ea8", "#41b6c4", "#c7e9b4", "#ffffd9", "#fff83a", "#ffab00", "#ff722a", "#ff2900"],
          months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
          days = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
    svg = d3.select("#chartContainer").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
      var monthLabels = svg.selectAll(".monthLabel")
          .data(months)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", "monthLabel mono axis");

      var dayLabels = svg.selectAll(".dayLabel")
          .data(days)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", "dayLabel mono axis");
    
    var dataToPlot = loadPrescriptionHeatmapDataset(drug, dataset);
    var heatmapChart = function(data) {
        
        //d3.json(data,
        //function(error, data) {
          var colorScale = d3.scale.quantile()
              .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
              .range(colors);

          var cards = svg.selectAll(".day")
              .data(data, function(d) {return d.month+'-'+d.day;});

          cards.append("title");

          cards.enter().append("rect")
              .attr("x", function(d) { return (d.day - 1) * gridSize; })
              .attr("y", function(d) { return (d.month - 1) * gridSize; })
              .attr("rx", 4)
              .attr("ry", 4)
              .attr("class", "day bordered")
              .attr("width", gridSize)
              .attr("height", gridSize)
              .style("fill", colors[0]);

          cards.transition().duration(1000)
              .style("fill", function(d) { return colorScale(d.value); });

          cards.select("title").text(function(d) { return d.value; });
          
          cards.exit().remove();

          var legend = svg.selectAll(".legend")
              .data([0].concat(colorScale.quantiles()), function(d) { return d; });

          legend.enter().append("g")
              .attr("class", "legend");

          legend.append("rect")
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height)
            .attr("width", legendElementWidth)
            .attr("height", gridSize / 2)
            .style("fill", function(d, i) { return colors[i]; });

          legend.append("text")
            .attr("class", "mono")
            .text(function(d) { return "≥ " + Math.round(d); })
            .attr("x", function(d, i) { return legendElementWidth * i; })
            .attr("y", height + gridSize);

          legend.exit().remove();

        } 
      //};
    
     heatmapChart(dataToPlot);
}

function deleteChart(){
    try{
        delete myChart.legends;
        myLegend.shapes.remove();
        myChart.series.forEach(function(series){
            series.data = undefined;
            series.shapes.remove();
        });
        //myChart = null;
    }
    catch(e){}
    finally{
        //d3.select("svg").remove();
        //d3.select("svg").selectAll('*').remove();
        var svg = null;
        $('svg').remove();
    }
}




var svg = dimple.newSvg("#chartContainer", '100%', 400);
var myChart = new dimple.chart(svg, null);
myChart.setBounds(60, 30, '73%', '75%');
var xDateAxis = myChart.addTimeAxis("x", "date", "%Y-%m-%d", "%d/%m/%Y");
xDateAxis.addOrderRule("date");
xDateAxis.title = "Fecha";
var xQuantityAxis = myChart.addMeasureAxis("x", "value");

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
var prescriptionSeries = myChart.addSeries("type", null, null);
var eeagSeries = myChart.addSeries("EEAG", null, null);
var hdrsSeries = myChart.addSeries("HDRS", null, null);
var ymrsSeries = myChart.addSeries("YMRS", null, null);
var panssPosSeries = myChart.addSeries("PANSS POS", null, null);
var panssNegSeries = myChart.addSeries("PANSS NEG", null, null);
var panssGenSeries = myChart.addSeries("PANSS GEN", null, null);

var myLegend =  myChart.addLegend('83%', 30, '22%', '50%', "right");




