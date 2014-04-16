var _data;

jQuery(function($) {

    var from = getQueryVariable('from');
    var to = getQueryVariable('to');

    if(from) {
        var url = atob(from).replace("&quot;","\"").replace(/%26quot%3B/g,"\"").replace(/%20/g,"+")+"&callback=?";
        $.getJSON(url.replace("&quot;","\""),function(records){

            createExplorer(new recline.Model.Dataset({
                    records: records
            }));

            if(to) {
                var url = atob(to);
                var bt = $("<buttton>Finish and Save</button>");
                bt.on('click',function(){
                    var data = JSON.stringify(_data.records.models.map(function(a){return a.attributes;}));
                    var form = $('<form method="POST" action="'+url+'"></form>');
                    form.append('<input name="data" type="hidden" value=\''+data+'\'" />');
                    $("body").append(form);
                    form.submit();
                });
                bt.addClass('btn');
                $(".menu-right a").remove();
                $(".menu-right").append(bt);
            }

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

