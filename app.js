var _data;

jQuery(function($) {

    var from = getQueryVariable('from');
    var to = getQueryVariable('to');
    var dFields = getQueryVariable('fields');
    //var dFields = 'occurrenceID,family,scientificName,recordedBy:collector,recordNumber:collectorNumber,collectionCode:collection,catalogNumber,stateProvince:state,municipality:city,locality,remarks,decimalLatitude:latitude,decimalLongitude:longitude,georeferenceVerificationStatus:geoStatus,georeferenceProtocol:geoProtocol,coordinateUncertaintyInMeters:geoPrecision';

    if(from) {
        var url = from+"&callback=?";
        $.getJSON(url.replace("&quot;","\""),function(records){

            var fields=[];
            if(dFields) {
                fields = dFields.split(','); 
            } else {
                for(var i in records[0]) {
                    fields.push(i);
                }
            }

            var columns = fields.map(function(f){
                return {
                    id: /^[a-zA-Z]+/.exec(f)[0],
                    width: 300,
                    label: /[a-zA-Z]+$/.exec(f)[0]
                }
            });

            createExplorer(new recline.Model.Dataset({
                records: records,
                fields: columns
            })); 

            if(to) {
                var url = to;
                var bt = $("<buttton>Finish and Save</button>");
                bt.on('click',function(){
                    var data = JSON.stringify(_data.records.models.map(function(a){return a.attributes;}));
                    var form = $('<form method="POST" action="'+url+'"></form>');
                    form.append('<input name="data" type="hidden" value=\''+data+'\'" />');
                    $("body").append(form);
                    form.submit();
                });
                bt.addClass('btn');
                $(".menu-right").append(bt);
            }

            $(".menu-right a").remove();

        });

    }
});


var createExplorer = function(dataset) {

    _data = dataset;

    var $el = $('<div />');
    $el.appendTo($('.data-explorer-here'));

    var views = [
        {
            id: 'grid',
            label: 'Grid',
            view: new recline.View.SlickGrid({
                model: dataset,
                state: {
                    gridOptions: {
                        editable: true,
                        //enabledAddRow: true,
                        //enabledDelRow: true,
                        autoEdit: false,
                        enableCellNavigation: true
                    }
                }
            })
        },
        {
            id: 'map',
            label: 'Map',
            view: new recline.View.Map({
                model: dataset
            })
        }
        /*
        {
            id: 'graph',
            label: 'Graph',
            view: new recline.View.Graph({
                model: dataset
            })
        }
        */
    ];

    new recline.View.MultiView({
        model: dataset,
        el: $el,
        views: views
    });

}


function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

