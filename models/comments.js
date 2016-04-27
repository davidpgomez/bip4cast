var mongoose =  require('mongoose');

var commentsSchema = mongoose.Schema({
    patientId : String,
    name : String,
    // drug type: 0: lithium, 1: antiepileptic, 2: antipsychotics, 3: anxiolytics/hypnotics, 4: antidepressants, 5: others
    type : Number,
    dateStart : Date,
    dateEnd : Date,
    time : Number,
    dose : Number,
    title : String,
    text : String,
    prescription : Boolean
});

var comments = mongoose.model('comments', commentsSchema);

module.exports = comments;