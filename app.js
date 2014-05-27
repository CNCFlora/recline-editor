var _data;
var fields=[];

jQuery(function($) {

    var from = getQueryVariable('from');
    var to = getQueryVariable('to');
    var dFields = getQueryVariable('fields');
    //var dFields = 'occurrenceID,family,scientificName,recordedBy:collector,recordNumber:collectorNumber,collectionCode:collection,catalogNumber,stateProvince:state,municipality:city,locality,remarks,decimalLatitude:latitude,decimalLongitude:longitude,georeferenceVerificationStatus:geoStatus,georeferenceProtocol:geoProtocol,coordinateUncertaintyInMeters:geoPrecision';

    if(from) {
        var url = from+"&callback=?";
        $.getJSON(url.replace("&quot;","\""),function(records){

            if(dFields) {
                fields = dFields.split(','); 
            } else {
                for(var i in records[0]) {
                    if(typeof records[0][i] != 'object') {
                        fields.push(i);
                    }
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
                    var data = JSON.stringify(_data.records.models.map(function(a){return a.attributes;})).replace(/'/g,"`");
                    var form = $('<form method="POST" action="'+url+'"></form>');
                    form.append('<input name="data" type="hidden" value=\''+data+'\'" />');
                    $("body").append(form);
                    form.submit();
                });
                bt.addClass('btn');
                $(".menu-right").append(bt);
            }

            var downLink = $("<a href='blob:data' download='data.csv'>Download as CSV</a>");
            $(".container").append(downLink);
            downLink.click(function(){
                var data = _data.records.models.map(function(a){
                        return a.attributes;
                    }).map(function(a){
                         var ar =[];
                         for(var i in fields) {
                             if(typeof a[fields[i]] != "undefined") {
                                 ar.push(a[fields[i]].replace(";",","));
                             } else {
                                 ar.push(null);
                             }
                         }
                         return ar;
                    });
                var encodedUri = encodeURI(toCSV(data));
                console.log(encodedUri);
                $(this).attr("href",encodedUri);
                return true;
            });

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

function toCSV(data) {
    var csvContent = "data:text/csv;charset=utf8,"+fields.map(function(f){ return /[a-zA-Z]+$/.exec(f)[0]; }).join(";")+"\n";
    data.forEach(function(infoArray, index){
        dataString = infoArray.join(";");
        csvContent += index < infoArray.length ? dataString+ "\n" : dataString;
    }); 
    return csvContent;
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

