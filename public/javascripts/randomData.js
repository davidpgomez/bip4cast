/**
* A script for generating medical data using Gaussian and Chi-Squared pseudo-random numbers, 
* and to be represented in bip4cast data visualization system
*/

// drugstype
var drugsTypeName = ['litio', 'antiepileptico', 'antipsicotico', 'ansioliticos/hipnoticos', 'antidepresivos', 'otros'];

/** 
* GAUSSIAN DISTRIBUTION
* Returns a random number following a Gaussian distribution with mean mean and 
* deviation stdev using Marsaglia polar method
*/
function gaussian(mean, stdev) {
    var y2;
    var use_last = false;
    return function() {
        var y1;
        if(use_last) {
           y1 = y2;
           use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                 x1 = 2.0 * Math.random() - 1.0;
                 x2 = 2.0 * Math.random() - 1.0;
                 w  = x1 * x1 + x2 * x2;               
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
       }

       var retval = mean + stdev * y1;
       if(retval > 0) 
           return retval;
       return -retval;
   }
}

/**
* A method to obtain pseudo-random integers following a Gaussian distribution
* with mean mean and standard deviation stdev, and between min and max (both include)
*/
function gaussianInteger(mean, stdev, min, max){
    var gauss = gaussian(mean, stdev);
    var value = gauss();
    // if the returned value is out of range, we pick another one
    while(value < min || value > max){
        value = gauss();
    }
    return Math.floor(value);
}

/** 
* CHI-SQUARED DISTRIBUTION
* Returns a random number following a Chi-Squared distribution with freedDeg 
* degrees of freedom.
*/
function chiSquare(freedDeg){
    return function() {
      if (freedDeg === undefined) {
        freedDeg = 1;
      }
        var i, z, sum = 0.0;
      for (i = 0; i < freedDeg; i++) {
        z = gaussian(0,1)();
        sum += z * z;
      }

      return sum;
    }
}

/**
* A method to obtain pseudo-random integers following a Chi-Squared distribution
* with freedDeg degrees of freedom, and between min and max (both include)
*/
function chiSquareInteger(freedDeg, min, max){
    var chisq = chiSquare(freedDeg);
    var value = chisq();
    // if the returned value is out of range, we pick another one
    while(value < min || value > max){
        value = chisq();
    }
    return Math.floor(value);
}


function createChiSquaredPrescriptionsJSON(beginDate, endDate, freedDeg){
	var json = JSON.parse('[]');
    // we create all the dates in the given interval
    var datesInterval = generateDates(beginDate, endDate);
    // number of prescriptios during the given interval
    var intervalsNumber = chiSquareInteger(freedDeg, 0, datesInterval.length)
    
    var dates = [];
    // we select datesInterval dates from the interval, they will be the start dates
    // for the prescriptions
    for (var i=0; i < intervalsNumber; i++){
        dates.push(datesInterval[chiSquareInteger(freedDeg, 0, datesInterval.length-1)]);
    }
     // create a prescription
    for(var j = 0; j < dates.length; j++){
        var d = dates[j];
        // for each prescription interval beginning, we pick a random number to be
        // the prescription time length
        var intervalLength = chiSquareInteger(freedDeg, 0, datesInterval.length-1);
        while (!intervalIsIn(d, intervalLength, endDate)){
            var intervalLength = chiSquareInteger(freedDeg, 0, datesInterval.length-1);
        }
        // then, we pick a drug type 
        var prescriptionBegin = new Date(parseDate(d));
        var prescriptionEnd = new Date(prescriptionBegin);
        prescriptionEnd.setDate(prescriptionBegin.getDate() + intervalLength);
        var drug = drugsTypeName[chiSquareInteger(freedDeg, 0, drugsTypeName.length-1)];
        // and finally we create that drug prescription in the same format as bip4cast API gives it
        for (var day = prescriptionBegin; day<=prescriptionEnd; day.setDate(day.getDate() + 1)){
            json.push({'date' : dateToString(day), 'type' : drug, 'count' : 1});
        } 
    }
	return json;
}

function createGaussianPrescriptionsJSON(beginDate, endDate, mean, stdev){
	var json = JSON.parse('[]');
    // we create all the dates in the given interval
    var datesInterval = generateDates(beginDate, endDate);
    // number of prescriptios during the given interval
    var intervalsNumber = gaussianInteger(mean,stdev, 0, datesInterval.length)
    var dates = [];
    
    // we select datesInterval dates from the interval, they will be the start dates
    // for the prescriptions
    for (var i=0; i < intervalsNumber; i++){
        dates.push(datesInterval[gaussianInteger(datesInterval.length/2, datesInterval.length/4, 0, datesInterval.length-1)]);
    }
    // create a prescription
    for(var j = 0; j < dates.length; j++){
        var d = dates[j];
        // for each prescription interval beginning, we pick a random number to be
        // the prescription time length
        var intervalLength = gaussianInteger(mean, stdev, 0, datesInterval.length-1);
        while (!intervalIsIn(d, intervalLength, endDate)){
            var intervalLength = gaussianInteger(mean, stdev, 0, datesInterval.length-1);
        }
        // then, we pick a drug type 
        var prescriptionBegin = new Date(parseDate(d));
        var prescriptionEnd = new Date(prescriptionBegin);
        prescriptionEnd.setDate(prescriptionBegin.getDate() + intervalLength);
        var drug = drugsTypeName[gaussianInteger(6, 3, 0, drugsTypeName.length-1)];       
        // and finally we create that drug prescription in the same format as bip4cast API gives it
        for (var day = prescriptionBegin; day<=prescriptionEnd; day.setDate(day.getDate() + 1)){
            json.push({'date' : dateToString(day), 'type' : drug, 'count' : 1});
        }
    }
	
	return json;
}

function intervalIsIn(date, intervalLength, endDate){
    var intervalEnd = new Date(parseDate(date));
    var end = new Date(parseDate(endDate));
    intervalEnd.setDate(intervalEnd.getDate() + intervalLength);
    return intervalEnd <= end;
}

// some utils

/**
* Given two dates (as String), returns an array with all the dates
* between beginDate y endDate
*/
function generateDates(beginDate, endDate){
    var begin = new parseDate(beginDate);
    var end = new parseDate(endDate);
    var dates = [];
    for (var d = begin; d<=end; d.setDate(d.getDate() + 1)){
        var e = new Date(d);
        dates.push(e.getFullYear()+'-'+(e.getMonth()+1)+'-'+e.getDate());
    }
    return dates;
}

/**
* A standard toString method for Date
*/
function dateToString(date){
    return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
}

/** 
* Given a date (as a String YYYY/MM/DD or DD/MM/YYYY) it returns the same
* date as a Date instance.
*/
function parseDate(date){
    if(date == null)
        return null;
    var regex = /\/|\-/;
    var parsedDate = date.split(regex);
    // if format is YYYY/MM/DD 
    if(parsedDate[0].length == 4){
        return new Date(parseInt(parsedDate[0], 10), parseInt(parsedDate[1], 10)-1, parseInt(parsedDate[2], 10));
    }
    else // if format is DD/MM/YYYY
        return new Date(parseInt(parsedDate[2], 10), parseInt(parsedDate[1],10)-1, parseInt(parsedDate[0],10));
}

