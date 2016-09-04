var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var connect = require('connect');
var Rest = require('connect-rest');

// authentication
var auth = require('http-auth');
var basic_auth = auth.basic({
    realm : "Scribe JS WebPanel",
    file : __dirname + "/user.sysadmin"
});

// connect 
var connectApp = connect().use( bodyParser.urlencoded({extended : true})).use(bodyParser.json());

// logger
/*
var scribe = require('scribe-js')();
var console = process.console;
*/
// add handlebars annd create a default layout
var exphbs = require('express-handlebars');
// add tools
var tools = require('./lib/tools.js');

var app = express(); 

// set views path and listening port
app.set('views', __dirname + '/views');
app.set('port', process.env.port || 5000);

// set logger
/*
app.use(scribe.express.logger());
app.use('/logs', auth.connect(basic_auth), scribe.webPanel());
console.addLogger('debug','blue');
console.addLogger('error', 'red');
console.addLogger('log', 'white');
*/

// view engine setup
app.engine('handlebars', exphbs({ 
    defaultLayout : 'main',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
}));
app.set('view engine', 'handlebars');

// set body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// static content declaration
app.use('/js', express.static(__dirname + '/public/bootstrap/dist/js')); // redirect JS bootstrap
app.use('/js', express.static(__dirname + '/public/bootstrap/assets/js')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/public/javascripts'));
app.use('/css', express.static(__dirname + '/public/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/css', express.static(__dirname + '/public/bootstrap/assets/css')); // redirect CSS bootstrap
app.use('/fonts', express.static(__dirname +  '/public/bootstrap/dist/fonts')); // redirect fonts bootstrap
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


// patient sign-up form, form process and unregistration form
app.get('/register', function(req, res){
    var context = {
        pagetitle : 'Alta paciente',
        regiactive : true
    };
    res.render('register', context);
});

app.post('/register/process', function(req, res){
    console.log('Form (from querystring): ' + req.query.form);
    phenotype.find({email : req.body.email}, function(err, results){
        if (results.length != 0){
            console.log('The patient already exists.');
            if(req.xhr) 
               return res.json({ success: true});
            req.session.flash = {
                type : 'alert',
                intro : 'The patient already exists.',
                message : 'Please check and try again.'
            };
           return res.redirect(303, '/register');
        }
        else{
            // adding info to DB
            new phenotype({
            email : req.body.email,
            name : req.body.pac_name,
            pin : Math.floor(Math.random() * 999999),
            birthDate : tools.toDate(req.body.bday),
            gender : tools.toBoolean(req.body.gender),
            cohabitation : parseInt(req.body.cohabitation),
            diagnosis : req.body.diag,
            diagnosisAge : req.body.diagAge,
            senLit : tools.toBoolean(req.body.litsens),
            senVal : tools.toBoolean(req.body.valsens),
            senCar : tools.toBoolean(req.body.carsens),
            seasonality : tools.toBoolean(req.body.season),
            maniaCrises : parseInt(req.body.mancrisis),
            mixedCrises : parseInt(req.body.mixcrisis),
            freePeriod : parseInt(req.body.freeper),
            psycSymp : tools.toBoolean(req.body.psychs),
            others : req.body.others,
        }).save(function(err){
           if(req.xhr) 
               return res.json({ success: true});
            console.log('Patient added.')
            req.session.flash = {
                type : 'success',
                intro : 'User added!',
                message : 'The new patient has been added to the DB.'
            };
           return res.redirect(303, '/index');
            }); 
        }
    });  
});

app.get('/register/unregister/:pat_id', function(req, res){
    var pat_id = req.params.pat_id;
    phenotype.remove({_id : pat_id}, function(err){
        if(err){
            console.log('Error while trying to delete phenotype data from patient.');
            req.session.flash = {
                type : 'danger',
                intro : 'Error',
                message : 'Error while trying to delete phenotype data from patient.'
            };
        }
        comments.remove({user_id : pat_id}, function(err){
            if(err){
                console.log('Error while trying to delete prescriptions or messages data from patient.');
                req.session.flash = {
                    type : 'danger',
                    intro : 'Error',
                    message : 'Error while trying to delete prescriptions or messages data from patient.'
                };
            }
            records.remove({user_id : pat_id}, function(err){
                if(err){
                    console.log('Error while trying to delete medical test data from patient.');
                    req.session.flash = {
                        type : 'danger',
                        intro : 'Error',
                        message : 'Error while trying to delete medical test data from patient.'
                    };
                }
                if(req.xhr)
                    return res.json({ success : true});
                console.log('Patient info totally deleted.');
                req.session.flash = {
                    type : 'success',
                    intro : 'User deleted!',
                    message : 'All patient data has been removed from the DB.'
                };
                return res.redirect(303, '/index');
            });
        });
    });
});

// form processing

app.post('/tracing/process', function(req, res){
    var form = req.query.form;
    if (form == 'patientsearch'){
		console.log('Retrieving possible patients containing: ' + req.body.pac_name);
		var patientnameregex = new RegExp(req.body.pac_name, 'i');
		phenotype.find({name : patientnameregex}, function(err, results){
			if(err){
                console.error(err);
				res.redirect(303, '/index');
            }
			console.log('Number of results found: ' + results.length);
			// create context if there are no results
			if (results == undefined || results.length == 0){
				req.session.flash = {
                    type : 'info',
                    intro : 'Verás, esto es embarazoso...',
                    message : 'No se encontraron resultados para la búsqueda realizada'
                };
				res.redirect(303, '/index');
			}
			else{
				var context = {
				pagetitle : 'Resultados de la búsqueda',
				tracactive : true,
				pac_list : results.map(function(phenotype){ 
				return {
					pac_id : phenotype._id, 
					name : phenotype.name,
					birthDate : tools.parseDate(phenotype.birthDate),
					gender : tools.parseGender(phenotype.gender),
					}
					})
				};
				res.render('search-results/patient-search', context);
			}
		});
	}
    else if (form == 'editpatient'){
        var pat_id = req.query.patid;
        console.log('Updating patient' + pat_id+ ' info');
        phenotype.update({_id : pat_id},{
            email : req.body.email,
            name : req.body.name,
            birthDate : tools.toDate(req.body.bday),
            gender : tools.toBoolean(req.body.gender),
            cohabitation : parseInt(req.body.cohabitation),
            diagnosis : req.body.diag,
            diagnosisAge : req.body.diagAge,
            senLit : tools.toBoolean(req.body.litsens),
            senVal : tools.toBoolean(req.body.valsens),
            senCar : tools.toBoolean(req.body.carsens),
            seasonality : tools.toBoolean(req.body.season),
            maniaCrises : parseInt(req.body.mancrisis),
            mixedCrises : parseInt(req.body.mixcrisis),
            freePeriod : parseInt(req.body.freeper),
            psycSymp : tools.toBoolean(req.body.psychs),
            others : req.body.others,    
        }, function(err, result){
            if(err)
                console.error(err);
            if(req.xhr)
                return res.json({success : true});
            console.log('Patient info updated.');
            req.session.flash = {
                type : 'success',
                intro : 'Patient information updated',
                message : 'The info has been edited successfully.'
            };
            res.redirect(303, '/patient-info/'+pat_id+'/main');
        });
    }
    else if (form == 'updateprescriptions'){
        var pat_id = req.query.id;
        console.log('Date: ' + req.body.date);
        var date = tools.toDate(req.body.date).toISOString();
        comments.find({user_id : pat_id, prescription : true, dateStart : {$lte : date}, $or : 
                       [{dateEnd : { $gte : date}}, {dateEnd : null}]}, function(err, results){
            console.log('Quering active prescriptions of patient ' + pat_id + ' in ' + date);
            console.log('Results found: ' + results.length);
            var context = {
            pagetitle : 'Recetas',
            patientview : true,
            tracactive : true,
            presactive : true,
            pat_id : pat_id,
            comm_list : results.map(function(comments){
                return {
                    presid : comments._id,
                    name : comments.name,
                    type : comments.type,
                    dateStart : tools.parseDate(comments.dateStart),
                    dateEnd : tools.parseDate(comments.dateEnd),
                    time : tools.parseMinutes(comments.time),
                    dose : comments.dose,
                    title : comments.title,
                    text : comments.text,
                    raw : {
                        dateStart : tools.toRawDate(comments.dateStart),
                        dateEnd : tools.toRawDate(comments.dateEnd),
                        forever : comments.dateEnd==null?true:false
                    }
                }
            })
        };
        res.render('patients/prescriptions', context);
        });
    }
    else if (form == 'editprescriptions'){
        var pres_id = req.query.id;
        var pat_id = req.query.patid;
        console.log('Updating prescription ' + pres_id);
        var begindate = tools.toDate(req.body.begindate);
        var enddate;
        if(req.body.forever == 'on'){
            enddate = null;
        }
        else{
            enddate = tools.toDate(req.body.enddate);
        }
        comments.update({_id : pres_id}, {
            dateStart : begindate,
            dateEnd : enddate,
            time : tools.toMinutes(req.body.time),
            name : req.body.name,
            type : req.body.type,
            title : req.body.title,
            text : req.body.text,
            dose : parseInt(req.body.dose),
        }, function(err, result){
            if (err)
                console.error(err);
            if(req.xhr)
                return res.json({ success : true });
            console.log('Prescription edited.');
            req.session.flash = {
                type : 'success',
                intro : 'Prescription edited.',
                message : 'The prescription has been edited successfully.'
            };
            res.redirect(303,'/patient-info/'+pat_id+'/prescriptions');
        });
        
        
    }
    else if (form == 'addprescription'){
        var pat_id = req.query.patid;
        var begindate = tools.toDate(req.body.begindate);
        var enddate;
        if(req.body.forever == 'on'){
            enddate = null;
        }
        else{
            enddate = tools.toDate(req.body.enddate);
        }
        console.log('Adding prescription');
        new comments({
            user_id : pat_id,
            prescription : true,
            dateStart : begindate,
            dateEnd : enddate,
            name : req.body.name,
            type : req.body.type,
            time : tools.toMinutes(req.body.time),
            title : req.body.title,
            text : req.body.text,
            dose : parseInt(req.body.dose)
        }).save(function(err){
            if(err)
                console.error(err);
            if(req.xhr) 
                return res.json({ success: true});
            console.log('Prescription added.')
            req.session.flash = {
                type : 'success',
                intro : 'Prescription added.',
                message : 'The prescription has been added successfully.'
            };
        
            res.redirect(303, '/patient-info/'+pat_id+'/prescriptions');
        });
    }    
    else if (form == 'deleteprescription'){
        var pat_id = req.query.patid;
        var pres_id = req.query.id;
        console.log('Deleting prescription.');
        comments.remove({_id : pes_id}, function(err){
            if(err)
                console.error(err);
            if(req.xhr) 
                return res.json({ success : true });
            req.session.flash = {
                type : 'success',
                intro : 'Receta eliminada',
                message : 'Se ha eliminado la receta a la base de datos'
        };
            res.redirect(303, '/patient-info/'+pat_id+'/prescriptions');
        });       
    }
    else if (form == 'newrecord'){
        var pat_id = req.query.patid;
        // process form data
        var date = tools.toDate(req.body.date);
        console.log(date);
        // parsing test
        var eeag, hdrs, ymrs, panss_pos, panss_neg, panss_gen;
        if(req.body.valideeag == 'on'){
            // parse eeag
            console.log("EEAG valid test.");
            eeag = parseInt(req.body.eeag);
        }
        
        if (req.body.validhdrs == 'on'){
            //parse hdrs
            console.log("HDRS valid test.");
            hdrs = tools.parseHdrs(req.body);
        }
        
        if (req.body.validymrs == 'on'){
            // parse ymrs
            console.log("YMRS valid test.");
            ymrs = tools.parseYmrs(req.body);
        }
        if (req.body.validpansspos == 'on'){
            console.log("Positive PANSS valid test.");
            panss_pos = tools.parsePanssPos(req.body);
        }
        if (req.body.validpanssneg == 'on'){
            console.log("Negative PANSS valid test.");
            panss_neg = tools.parsePanssNeg(req.body);
        }
        if (req.body.validpanssgen == 'on'){
            console.log("General PANSS valid test.");
            panss_gen = tools.parsePanssGen(req.body);
        }
        
        new records({
            user_id : pat_id,
            date : date,
            eeag : eeag,
            hdrs : hdrs,
            ymrs : ymrs,
            panss : {
                panss_pos : panss_pos,
                panss_neg : panss_neg,
                panss_gen : panss_gen
            }
        }).save(function(err){
            if(err){
                console.error(err);
                res.redirect(500, '/index');
            }
            if(req.xhr) 
                return res.json({ success: true });
            console.log('Record added.');
            req.session.flash = {
                type : 'success',
                intro : 'Test added',
                message : 'The selected test has been added to the DB.'
            };
        
            res.redirect(303, '/patient-info/'+pat_id+'/records');
        });
    }
    else if (form == 'updaterecords'){
        var pat_id = req.query.id;
        console.log('Date: ' + req.body.date);
        var date = tools.toDate(req.body.date).toISOString();
        records.findOne({user_id : pat_id, date :  date}, function(err, results){
            if(results === null){
                console.log('No results found');
                return;
            }
            console.log('Quering patient ' + pat_id + ' tests in ' + date);
            var context = {
                pagetitle : 'Informes médicos',
                patientview : true,
                tracactive : true,
                recoactive : true,
                pat_id : pat_id,
                record : {
                    date : tools.parseDate(results.date),
                    eeag : results.eeag,
                    hdrs : results.hdrs,
                    hdrs_total : tools.parseRecord(results.hdrs, 'hdrs'),
                    ymrs : results.ymrs,
                    ymrs_total : tools.parseRecord(results.ymrs, 'ymrs'),
                    panss_gen : results.panss.panss_gen,
                    panss_gen_total : tools.parseRecord(results.panss.panss_gen, 'panss_gen'),
                    panss_neg : results.panss.panss_neg,
                    panss_neg_total : tools.parseRecord(results.panss.panss_neg, 'panss_neg'),
                    panss_pos : results.panss.panss_pos,
                    panss_pos_total : tools.parseRecord(results.panss.panss_pos, 'panss_pos'),
                    panss_total : this.panss_gen_total + this.panss_pos_total + this.panss_neg_total
                }
            };
            res.render('patients/records', context);
        });
    }
    else if (form == 'addmessage'){
        var pat_id = req.query.patid;
        var begindate = tools.toDate(req.body.begindate);
        var enddate;
        if(req.body.scheduled == 'on'){
            enddate = null;
        }
        else{
            enddate = tools.toDate(req.body.enddate);
        }
        console.log('Adding message');
        var now = new Date();
        if(req.body.sendnow = 'on'){
            console.log('Converting time...');
            time = tools.toMinutes(now.getHours()+':'+now.getMinutes());
        }
        else{
            time = tools.toMinutes(req.body.time);
        }
        new comments({
            user_id : pat_id,
            prescription : false,
            dateStart : begindate,
            dateEnd : enddate,
            time : time,
            text : req.body.text,
        }).save(function(err){
            if(err)
                console.error(err);
            if(req.xhr) 
                return res.json({ success: true});
            console.log('Message added.')
            req.session.flash = {
                type : 'success',
                intro : 'Message added',
                message : 'The message has been added to the DB'
            };
            res.redirect(303, '/patient-info/'+pat_id+'/communication');
        });
    }
    else if (form == 'editmessages'){
        var msgid = req.query.id;
        var pat_id = req.query.patid;
        console.log('Updating message ' + msgid);
        var begindate = tools.toDate(req.body.begindate);
        var enddate;
        if(req.body.scheduled == 'on'){
            enddate = null;
        }
        else{
            enddate = tools.toDate(req.body.enddate);
        }
        comments.update({_id : pres_id}, {
            dateStart : begindate,
            dateEnd : enddate,
            time : tools.toMinutes(req.body.time),
            text : req.body.text,
        }, function(err, result){
            if (err)
                console.error(err);
            if(req.xhr)
                return res.json({ success : true });
            console.log('Message edited.');
            req.session.flash = {
                type : 'success',
                intro : 'Message edited',
                message : 'The message has been edited'
            };
            res.redirect(303,'/patient-info/'+pat_id+'/prescriptions');
        });
    }
    else if (form == 'deletemessage'){
        var pat_id = req.query.patid;
        var msgid = req.query.id;
        console.log('Deleting message.');
        comments.remove({_id : msgid}, function(err){
            if(err)
                console.error(err);
            if(req.xhr) 
                return res.json({ success : true });
            req.session.flash = {
                type : 'success',
                intro : 'Message deleted',
                message : 'The message has been deleted from the DB'
        };
            res.redirect(303, '/patient-info/'+pat_id+'/communication');
        }); 
    }
    else if (form == 'updatemessages'){
        var pat_id = req.query.id;
        console.log('Date: ' + req.body.date);
        var date = tools.toDate(req.body.date).toISOString();
        comments.find({user_id : pat_id, prescription : false, dateStart : {$lte : date}, $or : 
                       [{dateEnd : { $gte : date}}, {dateEnd : null}]}, function(err, results){
            console.log('Quering active messages of patient ' + pat_id + ' in ' + date);
            if(results == null){
                console.log('No results found.');
                var context = {
                    pagetitle : 'Comunicación',
                    patientview : true,
                    tracactive : true,
                    commactive : true,
                    pat_id : pat_id,
                };
                res.render('patients/communication', context);
            }
            else{
                console.log('Results found: ' + results.length);
                var context = {
                    pagetitle : 'Comunicación',
                    patientview : true,
                    tracactive : true,
                    commactive : true,
                    pat_id : pat_id,
                    comm_list : results.map(function(comments){
                        return {
                            msgid : comments._id,
                            dateStart : tools.parseDate(comments.dateStart),
                            dateEnd : tools.parseDate(comments.dateEnd),
                            time : tools.parseMinutes(comments.time),
                            text : comments.text,
                            sched : tools.parseBoolean(comments.dateEnd==null?true:false),
                            raw : {
                                dateStart : tools.toRawDate(comments.dateStart),
                                dateEnd : tools.toRawDate(comments.dateEnd),
                                sched : comments.dateEnd==null?false:true
                            }
                        }
                    })
                };
                res.render('patients/communication', context);
            }
        });
    }
	else if (form == 'modalpatientsearch'){
		var query= req.query.q;
		console.log('Retrieving possible patients containing: ' + query);
		var patientnameregex = new RegExp(query, 'i');
		phenotype.find({name : patientnameregex}, function(err, results){
			if(err) console.error(err);
			console.log('Number of results found: ' + results.length);
			if(results.length > 0){
                res.render('portions/addpatientmodal', {layout : null, pat_list : results});
            }
            else{
                res.send('No se encontraron resultados para la búsqueda ');
            }
		});
	}
    else{
        send404(req, res);
    }
});



// patient info 
app.get('/patient-info/:pat_id/main', function(req, res){
    var pat_id = req.params.pat_id; // obtain pat_id from url
    console.log('Showing information about patient: ' + pat_id);
    phenotype.findOne({ _id : pat_id }, function(err, results){
        if(err || results === null){
            console.log('Patient info not found.');
            return send404(req, res);
        }
        console.log('Query completed.'); 
        // create context (map the query results to template)
        var context = {
            pagetitle : 'Información de paciente',
            patientview : true,
            tracactive : true,
            mainactive : true,
            pat_id : pat_id,
            pat : {
                pat_id : results._id, 
                name : results.name,
                birthDate : tools.parseDate(results.birthDate),
                gender : tools.parseGender(results.gender),
                cohabitation : tools.parseCohabitation(results.cohabitation),
                email : results.email,
                diagnosis : results.diagnosis,
                diagnosisAge : results.diagnosisAge,
                senLit : tools.parseBoolean(results.senLit),
                senCar : tools.parseBoolean(results.senCar),
                senVal : tools.parseBoolean(results.senVal),
                seasonality : tools.parseBoolean(results.seasonality),
                maniaCrises : results.maniaCrises,
                mixedCrises : results.mixedCrises,
                freePeriod : results.freePeriod,
                psycSymp : tools.parseBoolean(results.psycSymp),
                others : results.others,
            },
            raw : {
                bday : tools.toRawDate(results.birthDate),
                gender : results.gender,
                lisens : tools.parseRawBoolean(results.senLit),
                carbsens : tools.parseRawBoolean(results.senCar),
                valsens : tools.parseRawBoolean(results.senVal),
                season : tools.parseRawBoolean(results.seasonality),
                psyc : tools.parseRawBoolean(results.psycSymp),
                cohab : results.cohabitation
            }
        };
        res.render('patients/main', context);
    });
});

app.get('/patient-info/:pat_id/prescriptions', function(req, res){
    var pat_id = req.params.pat_id; // obtain pat_id from url
    comments.find({ user_id : pat_id, prescription : true}, function(err, results){
        if(err) console.error(err);
        console.log('Retrieving comments info from patient ' + pat_id);
        console.log('Number of results found: ' + results.length); 
        // creating context
        var context = {
            pagetitle : 'Recetas',
            patientview : true,
            tracactive : true,
            presactive : true,
            pat_id : pat_id,
            comm_list : results.map(function(comments){
                return {
                    presid : comments._id,
                    name : comments.name,
                    type : comments.type,
                    dateStart : tools.parseDate(comments.dateStart),
                    dateEnd : tools.parseDate(comments.dateEnd),
                    time : tools.parseMinutes(comments.time),
                    dose : comments.dose,
                    title : comments.title,
                    text : comments.text,
                    raw : {
                        dateStart : tools.toRawDate(comments.dateStart),
                        dateEnd : tools.toRawDate(comments.dateEnd),
                        forever : comments.dateEnd==null?true:false
                    }
                }
            })
        };
        res.render('patients/prescriptions', context);
    });
    
});

app.get('/patient-info/:pat_id/records', function(req, res){
    var pat_id = req.params.pat_id;
    records.findOne({user_id : pat_id}, function(err, results){
        if(err) console.error(err);
        console.log('Retrieving last records info from patient: ' + pat_id);
        //creating context and render result
        if(results == null){
            console.log('No results found.');
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
                    date : tools.parseDate(results.date),
                    eeag : results.eeag,
                    hdrs : results.hdrs,
                    hdrs_total : tools.parseRecord(results.hdrs, 'hdrs'),
                    ymrs : results.ymrs,
                    ymrs_total : tools.parseRecord(results.ymrs, 'ymrs'),
                    panss_gen : results.panss.panss_gen,
                    panss_gen_total : tools.parseRecord(results.panss.panss_gen, 'panss_gen'),
                    panss_neg : results.panss.panss_neg,
                    panss_neg_total : tools.parseRecord(results.panss.panss_neg, 'panss_neg'),
                    panss_pos : results.panss.panss_pos,
                    panss_pos_total : tools.parseRecord(results.panss.panss_pos, 'panss_pos'),
                    panss_total : this.panss_gen_total + this.panss_pos_total + this.panss_neg_total
                }
            };
            res.render('patients/records', context);
        }
    });
});

app.get('/patient-info/:pat_id/records/newtest', function(req, res){
    var test = req.params.type;
    var context = {
        pagetitle : 'Informes médicos',
        patientview : true,
        tracactive : true,
        recoactive : true,
        pat_id : req.params.pat_id,
    }
    res.render('patients/newrecord', context);
});

app.get('/patient-info/:pat_id/communication', function(req, res){
    var pat_id = req.params.pat_id;
    comments.find({ user_id : pat_id, prescription : false}, function(err, results){
        if(err) console.error(err);
        console.log('Retrieving comments info from patient ' + pat_id);
        console.log('Number of results found: ' + results.length); 
        // creating context
        var context = {
            pagetitle : 'Comunicación',
            patientview : true,
            tracactive : true,
            commactive : true,
            pat_id : pat_id,
            comm_list : results.map(function(comments){
                return {
                    msgid : comments._id,
                    dateStart : tools.parseDate(comments.dateStart),
                    dateEnd : tools.parseDate(comments.dateEnd),
                    time : tools.parseMinutes(comments.time),
                    text : comments.text,
                    sched : tools.parseBoolean(comments.dateEnd==null?true:false),
                    raw : {
                        dateStart : tools.toRawDate(comments.dateStart),
                        dateEnd : tools.toRawDate(comments.dateEnd),
                        sched : comments.dateEnd==null?false:true
                    }
                }
            })
        };
        res.render('patients/communication', context);
    });
});

// data visualization
app.get('/visualization', function(req, res){
    var context = {
        pagetitle : 'Visualización',
        visuactive : true
    };
    res.render('visualization', context);
});

// API configuration

var apiOptions = {
	'context' : '/api'
}
var rest = Rest.create(apiOptions);
app.use(rest.processRequest());

// link API into pipeline

rest.post('/prescriptions/:pat_id', function(req, content, cb){
	var pat_id = req.params.pat_id; // obtain pat_id from url
	var begindate = tools.toDate(content.beginDate);
	var enddate = tools.toDate(content.endDate);
	comments.find({ user_id : pat_id, prescription : true}, function(err, results){
		if(err) return cb({error : 'Internal server error.'});
		if(results.length === 0)
			cb(null, results);
		else{
			var data = results.map(function(p){
				return{
					beginDate : p.dateStart,
					endDate : p.dateEnd,
					type : p.type
				}
			});
			cb(null, tools.createPrescriptionsJSON(data, begindate, enddate));
		}
	});
});

rest.post('/test/:pat_id', function(req, content, cb){
	var pat_id = req.params.pat_id; // obtain pat_id from url
	var begindate = tools.toDate(content.beginDate);
	var enddate = tools.toDate(content.endDate);
	records.find({ user_id : pat_id, date : {$gte : begindate, $lte : enddate}}, function(err, results){
		if(err) return cb({error : 'Internal server error.'});
		if(results.length === 0)
			cb(null, results);
		else{
			var data = results.map(function(p){
				return{
					date : p.date,
					eeag : p.eeag,
					hdrs : tools.parseRecord(p.hdrs, 'hdrs'),
					ymrs : tools.parseRecord(p.ymrs, 'ymrs'),
					panss_gen : tools.parseRecord(p.panss.panss_gen, 'panss_gen'),
					panss_pos : tools.parseRecord(p.panss.panss_pos, 'panss_pos'),
					panss_neg : tools.parseRecord(p.panss.panss_neg, 'panss_neg')
				}
			});
			cb(null, tools.createRecordsJSON(data));
		}
	});
});



// error handlers

function send404(req, res){
    res.status(404);
    res.render('404', {pagetitle : '404 - Not Found', url : req.url});
}


// error 404 catch-all handler
app.use(function(req, res, next) {
    send404(req,res);
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



module.exports = app;
