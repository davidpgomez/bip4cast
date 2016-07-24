Handlebars.getTemplate = function(name) {
if (Handlebars.template === undefined || Handlebars.template[name] === undefined)    {
    $.ajax({
        url : name + '.handlebars',
        success : function(data) {
            if (Handlebars.template === undefined) {
                Handlebars.template = {};
            }
            Handlebars.template[name] = Handlebars.compile(data);
        },
        async : false
    });
}
return Handlebars.template[name];
};