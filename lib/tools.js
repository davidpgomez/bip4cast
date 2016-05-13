// This is a tools file

var weekdaynames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
var monthnames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
// auxiliary functions
// Parses the date in a ISODate string (e.g. Fri Aug 27 1993 11:00:00 GMT+0200 (CEST)) format and converts it into a Spanish time and date format
exports.parseDate = function(date){
    var parsedDate = new Date(date);
    var weekday = weekdaynames[parsedDate.getDay()];
    // getMonth in [0..11]
    var month = monthnames[parsedDate.getMonth()];
    return weekday.concat(", ", parsedDate.getDate()," ",month.toString(), " ", parsedDate.getFullYear());
};

// Parses boolean values into Spanish words for true and false
exports.parseBoolean = function(value){
    var parsedValue = "No";
    if(value)
        parsedValue = "Si";
    
    return parsedValue;
}

// Parses conviviality values (0: alone, 1: couple, 2: couple and childs, 3: parents, 4: other)
exports.parseCohabitation = function(conv){
    switch(conv){
        case 0: return 'Solo';
        case 1: return 'Pareja';
        case 2: return 'Pareja e hijos';
        case 3: return 'Familia de origen';
        default : return 'Otros';
    }
}

// Parses a date from a form given in DD/MM/YYYY format and returns a new Date
exports.toDate = function(date){
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

// Parses a string from a form and returns its value into a boolean
exports.toBoolean = function(boolean){
    if(boolean == "T"){
        return true;
    }
    else if (boolean == "F")
        return false;
}

// Parses a integer containing minutes from 00:00 and returns a String with the hour un format HH:MM (24h)
exports.parseMinutes = function(mins){
    var hours = Math.floor(mins/60);
    var minutes = mins % 60;
    if(minutes >= 0 && minutes <10)
        minutes = '0' + minutes;
    return hours + ':' + minutes;
}
        
// Parses an hour (in format HH:MM 24H) and returns the number of minutes since 00:00 AM
exports.toMinutes = function(hour){
    if(hour == null)
        return null;
    var parsedHour = hour.split(':');
    return parseInt(parsedHour[0]) * 60 + parseInt(parsedHour[1]);
}

// Parses gender and returns the appropiate string
exports.parseGender = function(gender){
    if(gender) 
        return 'Mujer';
    else
        return 'Hombre';
}

// Parses a record and returns its total score
var hdrs_keys = ['deprMood',  'feelGuilty', 'suic', 'insoEarly', 'insoMiddle', 'insoLate', 'workActiv', 'retard',           'agitat', 'anxiPsych', 'anxiSomat', 'somsymptGastr', 'somsymptGener', 'geniSympt', 'hypochon', 'lossWeight',        'insight'];
var ymrs_keys = ['elevMood', 'incrActEner', 'sexuInters', 'sleep', 'irritab', 'speech', 'lanThoughDis','content','disAggrBehav', 'appearan', 'insight'];
var panss_pos_keys = ['delsus', 'concepDisor', 'halluBehav','excitem','grandios','suspc','hostil'];
var panss_neg_keys = ['blunAffec', 'emotWithd', 'pootRapor', 'passSocWithd', 'diffAbstThin', 'lspontConvflow', 'steo_think'];
var panss_gen_keys = ['somaConcer', 'anxiet', 'guiltFeels', 'tension', 'mannPost', 'depress', 'motoRetar', 'uncoop', 'unuThough', 'disorient', 'poorAtten', 'ljudInsight', 'distVolit', 'pinpContr', 'preoc', 'asocAvoid'];
exports.parseRecord = function(record, type){
    total = 0;
    if(type == 'hdrs'){
        for (i in hdrs_keys)
            if(record[hdrs_keys[i]] != null)
            total += record[hdrs_keys[i]];
    }
    else if (type == 'ymrs'){
        for (i in ymrs_keys)
            if(record[ymrs_keys[i]] != null)
            total += record[ymrs_keys[i]];
    }
    else if (type == 'panss_pos'){
        for (i in panss_pos_keys)
            if(record[panss_pos_keys[i]] != null)
                total += record[panss_pos_keys[i]];
    }
    else if(type == 'panss_neg'){
        for (i in panss_neg_keys)
            if(record[panss_neg_keys[i]] != null)
                total += record[panss_neg_keys[i]];
    }
    else if (type == 'panss_gen'){
        for (i in panss_gen_keys)
            if(record[panss_gen_keys[i]] != null)
                total += record[panss_gen_keys[i]];
    }
    return total;
}

// Parses a date (in ISO format) and returns it in format DD/MM/YYYY
exports.toRawDate = function(date){
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    return day + "/" + month + "/" + year;
}
