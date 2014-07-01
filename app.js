var _data;
var fields=[];

jQuery(function($) {

    var from = getQueryVariable('from');
    var to = getQueryVariable('to');
    var dFields = getQueryVariable('fields');

    if(from) {
        if(from.indexOf("?") < 0) {
            from+="?";
        }
        var url = from+"&callback=?";
        $.getJSON(url.replace("&quot;","\""),function(records){
            if(records.length <= 0) alert("no data");

            if(dFields) {
                fields = dFields.split(','); 
            } else {
                for(var c in records) {
                    for(var i in records[c]) {
                        if(typeof records[c][i] != 'object') {
                            var got=false;
                            for(var o in fields) {
                                if(fields[o] == i) {
                                    got=true;
                                }
                            }
                            if(!got) fields.push(i);
                        }
                    }
                }
            }

            var columns = fields.map(function(f){
                return {
                    id: /^[a-zA-Z0-9_]+/.exec(f)[0],
                    width: 300,
                    label: /[a-zA-Z0-9_]+$/.exec(f)[0]
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
                var data = _data.attributes.records.map(function(a){
                         var ar =[];
                         for(var i in fields) {
                             var f = /^[a-zA-Z0-9_]+/.exec(fields[i])[0];
                             if(typeof a[f] != "undefined") {
                                 if(typeof a[f] == 'string') {
                                     if(a[f] != null) {
                                         ar.push(a[f].replace(/;/g,",").replace(/"/g,"'"));
                                     } else {
                                         ar.push(null);
                                     }
                                 } else {
                                     ar.push(a[f]);
                                 }
                             } else {
                                 ar.push(null);
                             }
                         }
                         return ar;
                    });
                var encodedUri = encodeURI(toCSV(data));
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
        csvContent +=  dataString+ "\n";
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

