var mongoose =  require('mongoose');

var recordsSchema = mongoose.Schema({
    user_id : String,
    date : Date,
    eeag : Number,
    hdrs : {
        deprMood : Number,
        feelGuilty : Number,
        suic : Number,
        insoEarly : Number,
        insoMiddle : Number,
        insoLate : Number,
        workActiv : Number,
        retard : Number,
        agitat : Number,
        anxiPsych : Number,
        anxiSomat : Number,
        somsymptGastr : Number,
        somsymptGener : Number,
        geniSympt : Number,
        hypochon : Number,
        lossWeight : Number,
        insight : Number
    },
    ymrs : {
        elevMood : Number,
        incrActEner : Number,
        sexuInters : Number,
        sleep : Number,
        irritab : Number,
        speech : Number,
        lanThoughDis : Number,
        content : Number,
        disAggrBehav : Number,
        appearan : Number,
        insight : Number
    },
    panss : {
        panss_pos : {
            delsus : Number,
            concepDisor : Number,
            halluBehav : Number,
            excitem : Number,
            grandios : Number,
            suspc : Number,
            hostil : Number
        },
        panss_neg : {
            blunAffec : Number,
            emotWithd : Number,
            pootRapor : Number,
            passSocWithd : Number,
            diffAbstThin : Number,
            lspontConvflow : Number,
            steoThink : Number
        },
        panss_gen : {
            somaConcer : Number,
            anxiet : Number,
            guiltFeels : Number,
            tension : Number,
            mannPost : Number,
            depress : Number,
            motoRetar : Number,
            uncoop : Number,
            unuThough : Number,
            disorient : Number,
            poorAtten : Number,
            ljudInsight : Number,
            distVolit : Number,
            pinpContr : Number,
            preoc : Number,
            asocAvoid : Number
        }
    }
});

var records = mongoose.model('records', recordsSchema);

module.exports = records;