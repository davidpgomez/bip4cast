var mongoose =  require('mongoose');

var phenotypeSchema = mongoose.Schema({
    email : String,
    name : String,
    birthDate : Date,
    gender : Boolean,
    pin : Number,
    // convivility \in {0,1,2,3,4} 0: alone, 1: couple, 2: couple and childs, 3: parents, 4: other
    cohabitation : Number,
    diagnosis : String,
    diagnosisAge : Number,
    senLit : Boolean,
    senVal : Boolean,
    senCar : Boolean,
    seasonality : Boolean,
    maniaCrises : Number,
    mixedCrises : Number,
    freePeriod : Number,
    psycSymp : Boolean,
    others : String
});

var phenotype = mongoose.model('phenotype', phenotypeSchema);

module.exports = phenotype;