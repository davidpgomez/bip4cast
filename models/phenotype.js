var mongoose =  require('mongoose');

var phenotypeSchema = mongoose.Schema({
    name : String,
    birthDate : Date,
    gender : Boolean,
    email : String,
    pin : Number,
    // convivility \in {0,1,2,3,4} 0: alone, 1: couple, 2: couple and childs, 3: parents, 4: other
    conviviality : Number,
    diagnosis : String,
    ageOfOnset : Number,
    sensitiveToLithium : Boolean,
    sensitiveToValproate : Boolean,
    sensitiveToCarbamazepine : Boolean,
    seasonality : Boolean,
    freqManiacCrises : Number,
    freqMixedCrises : Number,
    freePeriod : Number,
    psychoticSymptoms : Boolean,
    otherDiagnoses : String
});

var phenotype = mongoose.model('phenotype', phenotypeSchema);

module.exports = phenotype;