var mongoose =  require('mongoose');

var commentsSchema = mongoose.Schema({
    user_id : String,
    prescription : Boolean,
    // drug type: 0: lithium, 1: antiepileptic, 2: antipsychotics, 3: anxiolytics/hypnotics, 4: antidepressants, 5: others
    dateStart : Date,
    dateEnd : Date,
    time : Number,
    name : String,
    type : Number,
    title : String,
    text : String,
    dose : Number
});

var comments = mongoose.model('comments', commentsSchema);

module.exports = comments;