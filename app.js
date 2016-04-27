var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');

// add handlebars annd create a default layout
var exphbs = require('express-handlebars');

var app = express(); 

// set views path and listening port
app.set('views', __dirname + '/views');
app.set('port', process.env.port || 5000);

// view engine setup
app.engine('handlebars', exphbs({ defaultLayout : 'main'}));
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname+'/public/favicon.ico'));
 
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());

// static content declaration
app.use(express.static(__dirname + '/public'));

// sessions handler
var credentials = require('./credentials.js');
app.use(session({
    cookieName : 'session',
    secret : credentials.cookieSecret,
    duration : 30 * 60 * 1000, // 30 minutes duration
    activeDuration : 5 * 60 * 1000, // 5 minutes extra
    ephemeral : true,
}));

// database connection and configuration
var mongoose = require('mongoose');
var dbname = 'test';

mongoose.connect('mongodb://localhost/' + dbname);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error to db: ' + dbname));
db.once('open',function(){
    console.log('Connection established with db: ' + dbname);
});

var phenotype = require('./models/phenotype.js');
var comments = require('./models/comments.js');
var records = require('./models/records.js');

phenotype.find(function(err, data){
    // if there are any data, we skip adding new data to db
    if(data.length) return;

    // else, we add data to db
    new phenotype({
        name : 'Pepito Pérez',
        birthDate : new Date('1993-08-27T09:00:00.000Z'),
        gender : 'M',
        email : 'pepito@mail.com',
        pin : 123456,
        conviviality : 0,
        diagnosis : 'E45.2',
        ageOfOnset : 15,
        sensitiveToLithium : false,
        sensitiveToValproate : false,
        sensitiveToCarbamazepine : false,
        seasonality : false,
        freqManiacCrises : 2,
        freqMixedCrises : 0,
        freePeriod : 10,
        psychoticSymptoms : 'No',
        otherDiagnoses : 'None'
    }).save();

    new phenotype({
        name : 'Juanita Jiménez',
        birthDate : new Date('1987-10-14T18:42:30.000Z'),
        gender : 'F',
        email : 'juanita@mail.com',
        pin : 456789,
        conviviality : 1,
        diagnosis : 'Z05.6',
        ageOfOnset : 15,
        sensitiveToLithium : false,
        sensitiveToValproate : true,
        sensitiveToCarbamazepine : false,
        seasonality : false,
        freqManiacCrises : 3,
        freqMixedCrises : 2,
        freePeriod : 6,
        psychoticSymptoms : 'Yes',
        otherDiagnoses : 'Allergic to peniciline'
    }).save();
});
comments.find(function(err, data){
    if(data.length) return;
    
    // marta mendez
    new comments({
        patientId : '5718e761345e5a844307efb4',
        name : 'Litio',
        type : 0,
        dateStart : new Date(2016,02,01),
        dateEnd : new Date(),
        time : 900,
        dose : 150,
        title : 'Medio comprimido',
        text : 'Acompañar de comida',
        prescription : true
    }).save();
    
    new comments({
        patientId : '5718e761345e5a844307efb4',
        name : 'Risperidal',
        type : 2,
        dateStart : new Date(2016,02,01),
        dateEnd : new Date(2016,02,29),
        time : 900,
        dose : 4000,
        title : 'Medio comprimido',
        text : 'Acompañar de comida',
        prescription : true
    }).save();
});
records.find(function(err, data){
    if(data.length)
        return;
    new records({
        patientId : '5718e761345e5a844307efb4',
        date : new Date(2016, 2, 1),
        eeag : 82,
    hdrs : {
        depr_mood : 1,
        feel_guilty : 4,
        suic : 0,
        inso_early : 0,
        inso_middle : 0,
        inso_late : 0,
        work_activ : 1,
        retard : 2,
        agitat : 4,
        anxi_psych : 7,
        anxi_somat : 3,
        somsympt_gastr : 0,
        somsympt_gener : 0,
        geni_sympt : 2,
        hypochon : 5,
        loss_weight : 2,
        insight : 0
    },
    ymrs : {
        elev_mood : 1,
        incr_act_ener : 2,
        sexu_inters : 0,
        sleep : 0,
        irritab : 0,
        speech : 1,
        lan_though_dis : 4,
        content : 1,
        dis_aggr_behav : 2,
        appearan : 0,
        insight : 1
    },
    panss_pos : {
        delsus : 2,
        concep_disor : 0,
        hallu_behav : 1,
        excitem : 2,
        grandios : 3,
        suspc : 2,
        hostil : 1
    },
    panss_neg : {
        blun_affec : 2,
        emot_withd : 3,
        poot_rapor : 0,
        pass_soc_withd : 0,
        diff_abst_thin : 0,
        lspont_convflow : 1,
        steo_think : 5
    },
    panss_gen : {
        soma_concer : 4,
        anxiet : 2,
        guilt_feels : 0,
        tension : 1,
        mann_post : 0,
        depress : 3,
        moto_retar : 0,
        uncoop : 1,
        unu_though : 0,
        disorient : 2,
        poor_atten : 5,
        ljud_insight : 4,
        dist_volit : 2,
        pinp_contr : 3,
        preoc : 0,
        asoc_avoid : 0
    },
    }).save();
    
    new records({
        patientId : '5718e761345e5a844307efb4',
        date : new Date(2016, 3, 1),
        eeag : 72,
    hdrs : {
        depr_mood : 2,
        feel_guilty : 3,
        suic : 1,
        inso_early : 1,
        inso_middle : 1,
        inso_late : 1,
        work_activ : 0,
        retard : 0,
        agitat : 0,
        anxi_psych : 5,
        anxi_somat : 4,
        somsympt_gastr : 1,
        somsympt_gener : 1,
        geni_sympt : 3,
        hypochon : 3,
        loss_weight : 0,
        insight : 0
    },
    ymrs : {
        elev_mood : 0,
        incr_act_ener : 0,
        sexu_inters : 1,
        sleep : 2,
        irritab : 2,
        speech : 3,
        lan_though_dis : 3,
        content : 1,
        dis_aggr_behav : 2,
        appearan : 0,
        insight : 1
    },
    panss_pos : {
        delsus : 1,
        concep_disor : 1,
        hallu_behav : 0,
        excitem : 5,
        grandios : 4,
        suspc : 4,
        hostil : 2
    },
    panss_neg : {
        blun_affec : 2,
        emot_withd : 2,
        poot_rapor : 1,
        pass_soc_withd : 1,
        diff_abst_thin : 1,
        lspont_convflow : 2,
        steo_think : 3
    },
    panss_gen : {
        soma_concer : 3,
        anxiet : 1,
        guilt_feels : 1,
        tension : 2,
        mann_post : 0,
        depress : 0,
        moto_retar : 0,
        uncoop : 2,
        unu_though : 1,
        disorient : 0,
        poor_atten : 3,
        ljud_insight : 0,
        dist_volit : 0,
        pinp_contr : 0,
        preoc : 1,
        asoc_avoid : 1
    },
    }).save();
});

// middleware use
app.use(function(req, res, next){
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

// rendering pages

// redirect main to index
app.get('/', function(req, res){
    res.redirect(303, '/index')
});

app.get('/index', function(req, res){
    var context = {
        pagetitle : 'Dashboard',
        dashactive : true
    }
    res.render('index', context);
});

app.get('/ok', function(req,res){
    res.render('ok');
});

app.get('/tracing', function(req, res){
    var context = {
    pagetitle : 'Seguimiento',
    tracactive : true
}
    res.render('tracing', context);
});

// searchpatient results page
app.post('/tracing/process', function(req, res){
    var form = req.query.form;
    if (form == 'patientsearch'){
        console.log('Form (from querystring): ' + req.query.form);
        console.log('Patient name (from visible form field): ' + req.body.pac_name);
        phenotype.find({name : req.body.pac_name}, function(err, results){
            if(err) console.error(err);
            console.log('Number of results found: ' + results.length);

            // create context and render results
            var context = {
                pagetitle : 'Resultados de la búsqueda',
                tracactive : true,
                pac_list : results.map(function(phenotype){ 
                  return {
                      pac_id : phenotype._id, 
                      name : phenotype.name,
                      birthDate : parseDate(phenotype.birthDate),
                      gender : parseGender(phenotype.gender),
                  }
              })
            };
            res.render('search-results/patient-search', context);
        });
    }
    else if (form == 'updateprescriptions'){
        var pat_id = req.query.id;
        console.log('Inicio: ' + req.body.begindate + ' Final ' + req.body.enddate);
        var begindate = toDate(req.body.begindate);
        var enddate = toDate(req.body.enddate);
        
        comments.find({patientId : pat_id, dateStart : {$gte : begindate, $lte : enddate}}, function(err, results){
            console.log('Quering prescriptions of patient ' + pat_id + ' between ' + begindate + ' and ' + enddate);
            console.log('Results found: ' + results.length);
            var context = {
            pagetitle : 'Recetas',
            patientview : true,
            tracactive : true,
            presactive : true,
            pat_id : pat_id,
            comm_list : results.map(function(comments){
                return {
                    name : comments.name,
                    dateStart : parseDate(comments.dateStart),
                    dateEnd : parseDate(comments.dateEnd),
                    time : parseMinutes(comments.time),
                    dose : comments.dose,
                    title : comments.title,
                    text : comments.text
                }
            })
        };
            
            res.render('patients/prescriptions', context);
        });
    }
});

app.get('/patient-info/:pat_id/main', function(req, res){
    var pat_id = req.params.pat_id; // obtain pat_id from url
    console.log('Showing information about patient: ' + pat_id);
    phenotype.findOne({ _id : pat_id }, function(err, results){
        if (err) console.error(err);
        console.log('Query completed.'); 
        // create context (map the query results to template)
        var context = {
            pagetitle : 'Información de paciente',
            patientview : true,
            tracactive : true,
            mainactive : true,
            pat_id : pat_id,
          pat_list : {
                  pat_id : results._id, 
                  name : results.name,
                  birthDate : parseDate(results.birthDate),
                  gender : parseGender(results.gender),
                  conviviality : parseConviviality(results.conviviality),
                  email : results.email,
                  diagnosis : results.diagnosis,
                  ageOfOnset : results.ageOfOnset,
                  sensitiveToLithium : parseBoolean(results.sensitiveToLithium),
                  sensitiveToCarbamazepine : parseBoolean(results.sensitiveToCarbamazepine),
                  sensitiveToValproate : parseBoolean(results.sensitiveToValproate),
                  seasonality : parseBoolean(results.seasonality),
                  freqManiacCrises : results.freqManiacCrises,
                  freqMixedCrises : results.freqMixedCrises,
                  freePeriod : results.freePeriod,
                  psychoticSymptoms : parseBoolean(results.psychoticSymptoms),
                  otherDiagnoses : results.otherDiagnoses,
              }
        };
        res.render('patients/main', context);
    });
});

app.get('/register', function(req, res){
    var context = {
        pagetitle : 'Alta paciente',
        regiactive : true
    };
    res.render('register', context);
});

app.post('/register/process', function(req, res){

    console.log('Form (from querystring): ' + req.query.form);
    /*
        TODO Typical db-related operations:
        check if an entry exists before create a new one
        edit an existing entry
        ...
    */
    // adding info to DB
   new phenotype({
        name : req.body.pac_name,
        birthDate : toDate(req.body.bday),
        gender : toBoolean(req.body.gender),
        email : req.body.email,
        conviviality : parseInt(req.body.conviviality),
        diagnosis : req.body.diag,
        ageOfOnset : req.body.ageOfOnset,
        sensitiveToLithium : toBoolean(req.body.litsens),
        sensitiveToValproate : toBoolean(req.body.valsens),
        sensitiveToCarbamazepine : toBoolean(req.body.carsens),
        stationality : toBoolean(req.body.station),
        psychoticSymptoms : toBoolean(req.body.psychs),
        freqManiacCrises : parseInt(req.body.mancrisis),
        freqMixedCrises : parseInt(req.body.mixcrisis),
        freePeriod : parseInt(req.body.freeper),
        otherDiagnoses : req.body.others,
    }).save(function(err){
       if(req.xhr) 
           return res.json({ success: true});
       console.log('Patient added.')
        req.session.flash = {
            type : 'success',
            intro : 'User added!',
            message : 'The new patient has been added to the DB.'
        };
       console.log(req.session.flash);
       return res.redirect(303, '/index');
   }); 
});

app.get('/patient-info/:pat_id/prescriptions', function(req, res){
    var pat_id = req.params.pat_id; // obtain pat_id from url
    comments.find({ patientId : pat_id}, function(err, results){
        if(err) console.error(err);
        console.log('Retrieving comments info from patient ' + pat_id);
        console.log('Number of results found: ' + results.lenght); 
        // creating context
        var context = {
            pagetitle : 'Recetas',
            patientview : true,
            tracactive : true,
            presactive : true,
            pat_id : pat_id,
            comm_list : results.map(function(comments){
                return {
                    name : comments.name,
                    dateStart : parseDate(comments.dateStart),
                    dateEnd : parseDate(comments.dateEnd),
                    time : parseMinutes(comments.time),
                    dose : comments.dose,
                    title : comments.title,
                    text : comments.text
                }
            })
        };
        res.render('patients/prescriptions', context);
    });
    
});

app.get('/patient-info/:pat_id/records', function(req, res){
    var pat_id = req.params.pat_id;
    records.findOne({patientId : pat_id}, function(err, results){
        if(err) console.error(err);
        console.log('Retrieving last records info from patient: ' + pat_id);
        //creating context and render result
        if(results == null){
            var context = {
                pagetitle : 'Informes médicos',
                patientview : true,
                tracactive : true,
                recoactive : true,
                pat_id : pat_id,
            };
            res.render('patients/records', context);    
        }
        else {
            var context = {
                pagetitle : 'Informes médicos',
                patientview : true,
                tracactive : true,
                recoactive : true,
                pat_id : pat_id,
                record : {
                    date : parseDate(results.date),
                    eeag : results.eeag,
                }
            };
            res.render('patients/records', context);
        }
    });
});
// to show requests headers information
/*
app.get('/headers', function(req, res){
    res.set('Content-Type','text/plain');
    var s : '';
    for(var name in req.headers) s+= name + ': ' + req.headers[name] + '\n';
    res.send(s);
});
*/
// error handlers

// error 404 catch-all handler
app.use(function(req, res, next) {
    res.status(404);
    res.render('404', {pagetitle : '404 - Not Found', url : req.url});
});

// error 500 catch-all handler
app.use(function(req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500', {pagetitle : '500 - Server Error' });
});


app.listen(app.get('port'), function(){
    console.log('Express.js service started on localhost:' + app.get('port') + '; press CTRL+C to terminate');
});


// auxiliary objects
var weekdaynames = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
var monthnames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
// auxiliary functions
// Parses the date in a ISODate string (e.g. Fri Aug 27 1993 11:00:00 GMT+0200 (CEST)) format and converts it into a Spanish time and date format
function parseDate(date){
    var parsedDate = new Date(date);
    var weekday = weekdaynames[parsedDate.getDay()-1];
    // getMonth in [0..11]
    var month = monthnames[parsedDate.getMonth()];
    return weekday.concat(", ", parsedDate.getDate()," ",month.toString(), " ", parsedDate.getFullYear());
};

// Parses boolean values into Spanish words for true and false
function parseBoolean(value){
    var parsedValue = "No";
    if(value)
        parsedValue = "Si";
    
    return parsedValue;
}

// Parses conviviality values (0: alone, 1: couple, 2: couple and childs, 3: parents, 4: other)
function parseConviviality(conv){
    switch(conv){
        case 0: return 'Solo';
        case 1: return 'Pareja';
        case 2: return 'Pareja e hijos';
        case 3: return 'Familia de origen';
        default : return 'Otros';
    }
}

// Parses a date from a form given in DD/MM/YYYY format and returns a new Date
function toDate(date){
    if(date == null)
        return null;
    var regex = /\/|\-/;
    var parsedDate = date.split(regex);
    console.log('La fecha leída es: ' + parsedDate);
    // if format is YYYY/MM/DD 
    if(parsedDate[0].length == 4){
        return new Date(parseInt(parsedDate[0], 10), parseInt(parsedDate[1], 10)-1, parseInt(parsedDate[2], 10));
    }
    else // if format is DD/MM/YYYY
        return new Date(parseInt(parsedDate[2], 10), parseInt(parsedDate[1],10)-1, parseInt(parsedDate[0],10));
}

// Parses a string from a form and returns its value into a boolean
function toBoolean(boolean){
    if(boolean == "T"){
        return true;
    }
    else if (boolean == "F")
        return false;
}

// Parses a integer containing minutes from 00:00 and returns a String with the hour un format HH:MM (24h)
function parseMinutes(mins){
    var hours = mins/60;
    var minutes = mins % 60;
    if(minutes >= 0 && minutes <10)
        minutes = '0' + minutes;
    return hours + ':' + minutes;
}

// Parses gender and returns the appropiate string
function parseGender(gender){
    if(gender) 
        return 'Mujer';
    else
        return 'Hombre'
}



module.exports = app;
