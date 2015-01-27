var prevPoint;
var plotData = [];
var lyrQuery;
var ctlBox;
var lyrCatalog = new OpenLayers.Layer.Vector();
var map;
var currentRange = {};
var spinner;
var proj3857 = new OpenLayers.Projection("EPSG:3857");
var proj4326 = new OpenLayers.Projection("EPSG:4326");
var dataTable;

function init() {
  $('#buoyTT').html(verbiage.buoyTT.a);
  $('#buoyTT').tooltip().attr('data-original-title',verbiage.buoyTT.info).tooltip('fixTitle');
  $('#modelTT').html(verbiage.modelTT.a);
  $('#modelTT').tooltip().attr('data-original-title',verbiage.modelTT.info).tooltip('fixTitle');

  $('#coords .btn-default').on('click',function() {
    $('#location').selectpicker('val','custom');
    $('#coords').modal('hide');
  });

  $('#settings-button button').on('click',function() {
    $('#range')
      .bootstrapValidator({
         excluded      : [':disabled']
        ,feedbackIcons : {
          valid      : 'glyphicon glyphicon-ok',
          invalid    : 'glyphicon glyphicon-remove',
          validating : 'glyphicon glyphicon-refresh'
        }
        ,fields : {
          customMin : {
            validators : {
              notEmpty : {
                message: 'This field is required.'
              }
              ,callback : {
                callback : function(value,validator) {
                  return $.isNumeric(value) && Number(value) < Number($('#customMax').val());
                }
              }
            }
          }
          ,customMax : {
            validators : {
              notEmpty : {
                message: 'This field is required.'
              }
              ,callback : {
                callback : function(value,validator) {
                  return $.isNumeric(value) && Number(value) > Number($('#customMin').val());
                }
              }
            }
          }
        }
      })
      .on('shown.bs.modal', function() {
        $('#range').bootstrapValidator('resetForm',true);
        $('#customMin').val(currentRange.f(currentRange.v[0]));
        $('#customMax').val(currentRange.f(currentRange.v[1]));
      })
      .on('error.validator.bv', function(e, data) {
        data.element
        // Hide all the messages
        .find('.help-block[data-bv-for="' + data.field + '"]').hide()
        // Show only message associated with current validator
        .filter('[data-bv-validator="' + data.validator + '"]').show();
      })
      .on('success.form.bv', function(e) {
        e.preventDefault();
        $('#range').modal('hide');
        query([currentRange.inv($('#customMin').val()),currentRange.inv($('#customMax').val())]);
      })
      .modal('show');
  });

  $('#new-box-button button').on('click',function() {
    $(this).blur();
    ctlBox.activate();
  });

  $(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
    event.preventDefault();
    return $(this).ekkoLightbox();
  });

  _.each(_.pluck(catalog.variables,'name').sort(),function(o) {
    $('#vars .panel-body').append('<button type="button" data-value="' + o + '" class="btn btn-default">' + o + '</button> ');
  });
  $('#vars [data-value="' + defaults.var + '"]').removeClass('btn-default').addClass('btn-custom-lighten active');
  $('#vars button').click(function() {
    $(this).blur();
    var selVal = $(this).data('value');
    $('#vars button').each(function() {
      if ($(this).data('value') == selVal) {
        $(this).removeClass('btn-default').addClass('btn-custom-lighten').addClass('active');
      }
      else {
        $(this).removeClass('btn-custom-lighten').removeClass('active').addClass('btn-default');
      }
    });
    currentRange = {};
    query();
  });

  _.each(catalog.intervals,function(o) {
    var selected = defaults.intervals.indexOf(o) >= 0 ? 'selected="selected"' : '';
    $('#intervals select').append('<option value="' + o + '" ' + selected + '>' + o + '</option> ');
  });
  $('#intervals').change(function() {
    for (var i = 0; i < catalog.intervals.length; i++) {
      dataTable.column(i + 1).visible(_.indexOf($('#intervals select').selectpicker('val'),catalog.intervals[i]) >= 0);
    }
    query(currentRange.v.slice());
  });

  _.each(catalog.years.sort(),function(o) {
    var selected = defaults.years.indexOf(o) >= 0 ? 'selected="selected"' : '';
    $('#years select').append('<option value="' + o + '" ' + selected + '>' + o + '</option> ');
  });
  $('#years').change(function() {
    query(currentRange.v.slice());
  });

  _.each(['Sea surface','Sea floor'],function(o) {
    $('#depths .panel-body').append('<button type="button" data-value="' + o + '" class="btn btn-default">' + o + '</button> ');
  });
  $('#depths [data-value="' + defaults.depth + '"]').removeClass('btn-default').addClass('btn-custom-lighten active');
  $('#depths button').click(function() {
    $(this).blur();
    var selVal = $(this).data('value');
    $('#depths button').each(function() {
      if ($(this).data('value') == selVal) {
        $(this).removeClass('btn-default').addClass('btn-custom-lighten').addClass('active');
      }
      else {
        $(this).removeClass('btn-custom-lighten').removeClass('active').addClass('btn-default');
      }
    });
    currentRange = {};
    query();
  });

  var wkt = new OpenLayers.Format.WKT();
  var i = 1;
  _.each(_.sortBy(_.keys(catalog.sites),function(o){return o.toUpperCase()}),function(grp) {
    $('#location').append('<optgroup label="' + grp + '">');
    _.each(_.sortBy(_.keys(catalog.sites[grp]),function(o){return o.toUpperCase()}),function(site) {
      var selected = 'custom' == site ? 'selected="selected"' : '';
      $($('#location optgroup')[i]).append('<option value="' + site + '" ' + selected + '>' + site + '</option>');
      var f = wkt.read(catalog.sites[grp][site]['wkt']);
      f.geometry.transform(proj4326,proj3857);
      f.attributes = {
         'group' : grp
        ,'name'  : site
      };
      lyrCatalog.addFeatures([f]);
    });
    i++;
  });

  $('#location').change(function() {
    $(this).blur();
    ctlBox.deactivate();
    var val = $(this).selectpicker().val();
    ctlBox.deactivate();
    if (val == 'manual') {
      $('#coords')
        .bootstrapValidator({
           excluded      : [':disabled']
          ,feedbackIcons : {
            valid      : 'glyphicon glyphicon-ok',
            invalid    : 'glyphicon glyphicon-remove',
            validating : 'glyphicon glyphicon-refresh'
          }
          ,fields : {
            customMinLat : {
              validators : {
                notEmpty : {
                  message: 'This field is required.'
                }
                ,callback : {
                  callback : function(value,validator) {
                    return $.isNumeric(value);
                  }
                }
              }
            }
            ,customMinLon : {
              validators : {
                notEmpty : {
                  message: 'This field is required.'
                }
                ,callback : {
                  callback : function(value,validator) {
                    return $.isNumeric(value);
                  }
                }
              }
            }
            ,customMaxLat : {
              validators : {
                notEmpty : {
                  message: 'This field is required.'
                }
                ,callback : {
                  callback : function(value,validator) {
                    return $.isNumeric(value);
                  }
                }
              }
            }
            ,customMaxLon : {
              validators : {
                notEmpty : {
                  message: 'This field is required.'
                }
                ,callback : {
                  callback : function(value,validator) {
                    return $.isNumeric(value);
                  }
                }
              }
            }
          }
        })
        .on('shown.bs.modal', function() {
          $('#coords').bootstrapValidator('resetForm',true);
          if (lyrQuery.features.length > 0) {
            var bounds = lyrQuery.getDataExtent().clone().transform(proj3857,proj4326).toArray();
            $('#customMinLon').val(Math.round(bounds[0] * 10000) / 10000);
            $('#customMinLat').val(Math.round(bounds[1] * 10000) / 10000);
            $('#customMaxLon').val(Math.round(bounds[2] * 10000) / 10000);
            $('#customMaxLat').val(Math.round(bounds[3] * 10000) / 10000);
          }
        })
        .on('error.validator.bv', function(e, data) {
          data.element
          // Hide all the messages
          .find('.help-block[data-bv-for="' + data.field + '"]').hide()
          // Show only message associated with current validator
          .filter('[data-bv-validator="' + data.validator + '"]').show();
        })
        .on('success.form.bv', function(e) {
          e.preventDefault();
          lyrQuery.removeAllFeatures();
          var f = new OpenLayers.Feature.Vector(
            new OpenLayers.Bounds($('#customMinLon').val(),$('#customMinLat').val(),$('#customMaxLon').val(),$('#customMaxLat').val()).toGeometry().transform(proj4326,proj3857)
          );
          lyrQuery.addFeatures([f]);
          map.zoomToExtent(f.geometry.getBounds());
          $('#location').selectpicker('val','custom');
          $('#coords').modal('hide');
          query(currentRange.v.slice());
        })
        .modal('show');
    }
    else {
      lyrQuery.removeAllFeatures();
      var f = _.find(lyrCatalog.features,function(o){return o.attributes.name == val});
      if (f) {
        lyrQuery.addFeatures([f.clone()]);
        map.zoomToExtent(f.geometry.getBounds());
        query(currentRange.v.slice());
      }
      $('#location').selectpicker('val','custom');
    }
  });

  $('.selectpicker').selectpicker({width : 200});

  var th = [];
  _.each(['Year'].concat(catalog.intervals),function(o) {
    th.push('<th>' + o + '</th>');
  });
  $('#dataTable thead').append('<tr>' + th.join('') + '</tr>');

  dataTable = $('#dataTable').DataTable({
     searching      : false
    ,lengthChange   : false
    ,paging         : false
    ,info           : false
    ,ordering       : false
    ,sScrollY       : 1
    ,aoColumnDefs   : [{sClass : 'alignCenter'}]
  });

  resizeAll();

  var style = new OpenLayers.Style(
    OpenLayers.Util.applyDefaults({
       pointRadius       : 6
      ,strokeColor       : '#000000'
      ,strokeWidth       : 1
      ,strokeOpacity     : 0.45
      ,fillColor         : '#ffffff'
      ,fillOpacity       : 0.3
    })
  );
  lyrQuery = new OpenLayers.Layer.Vector(
     'Query points'
    ,{styleMap : new OpenLayers.StyleMap({
       'default'   : style
      ,'select'    : style
    })}
  );
  lyrQuery.events.register('featureadded',this,function(e) {
    ctlBox.deactivate();
    query(currentRange.v ? currentRange.v.slice() : null);
  });

  var bm = new OpenLayers.Layer.ArcGIS93Rest(
     "ESRI Street World"
    ,"http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/export"
  );
  bm.params.FORMAT = "jpg";

  map = new OpenLayers.Map('map',{
    layers  : [
      new OpenLayers.Layer.XYZ(
         'ESRI Ocean'
        ,'http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/${z}/${y}/${x}.jpg'
        ,{
           sphericalMercator : true
          ,isBaseLayer       : true
          ,wrapDateLine      : true
        }
      )
      ,lyrQuery
    ]
    ,projection : proj3857
  });
  setTimeout(function() {
    map.zoomToExtent(new OpenLayers.Bounds(-101,13,-68,40).transform(proj4326,proj3857));
  },100);

  ctlBox = new OpenLayers.Control.DrawFeature(lyrQuery,OpenLayers.Handler.RegularPolygon);
  ctlBox.handler.setOptions({irregular : true});
  map.addControl(ctlBox);
  ctlBox.events.register('activate',this,function(e) {
    lyrQuery.removeAllFeatures();
  });

  var f = _.find(lyrCatalog.features,function(o) {
    return o.attributes.name == defaults.site;
  });
  lyrQuery.addFeatures([f.clone()]);
}

function showSpinner() {
  // from http://fgnass.github.io/spin.js/
  var opts = {
    lines: 18, // The number of lines to draw
    length: 35, // The length of each line
    width: 10, // The line thickness
    radius: 54, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb or array of colors
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '50%', // Top position relative to parent
    left: '50%' // Left position relative to parent
  };
  spinner = new Spinner(opts).spin(document.getElementById('spinner'));
}

function hideSpinner() {
  if (spinner) {
    spinner.stop();
    spinner = null;
  }
}

function niceSeasonRange(a) {
  if (a.length == catalog.intervals.length) {
    return 'ALL';
  }
  else {
    return a.length > 0 ? a.join(', ') : 'Nothing selected';
  }

  // The following code may be used if dealing w/ intervals other than seasons.
  var aBands = [];
  _.each(a,function(o) {
    if (aBands.length > 0 && aBands[aBands.length - 1][aBands[aBands.length - 1].length - 1] == catalog.intervals[_.indexOf(catalog.intervals,o) - 1]) {
      aBands[aBands.length - 1].push(o);
    }
    else {
      aBands.push([o]);
    }
  });
  var aOut = [];
  _.each(aBands,function(o) {
    if (o.length == 1) {
      aOut.push(o);
    }
    else {
      aOut.push(o[0] + '-' + o[o.length - 1]);
    }
  });

  return aOut.length > 0 ? aOut.join(', ') : 'Nothing selected';
}

function niceNumericRange(a) {
  var aBands = [];
  _.each(a,function(o) {
    if (aBands.length > 0 && aBands[aBands.length - 1][aBands[aBands.length - 1].length - 1] == o - 1) {
      aBands[aBands.length - 1].push(o); 
    }
    else {
      aBands.push([o]);
    }
  });
  var aOut = [];
  _.each(aBands,function(o) {
    if (o.length == 1) {
      aOut.push(o);
    }
    else {
      aOut.push(o[0] + '-' + o[o.length - 1]);
    }
  });

  return aOut.length > 0 ? aOut.join(', ') : 'Nothing selected';
}

function resizeMap() {
  $('#map').height($(window).height() - $('#locations').position().top - $('#map').position().top - 40);
  map && map.updateSize();
}

function resizeAll() {
  $('#resultsWrapper').height($(window).height() - $('#resultsWrapper').position().top - 24);
  $('.dataTables_scrollBody').height($('#resultsWrapper').height() - $('#legend').height() - 120);
  resizeMap();
}

function imgLoaded(img) {
  $(img).show().siblings().hide();
}

function query(customRange) {
  var v         = $('#vars .active').text();
  var depth     = $('#depths .active').text()
  var years     = $('#years select').selectpicker('val');
  var intervals = catalog.intervals;
  var bbox      = lyrQuery.getDataExtent().toArray();
  var legend    = 'img/blank.png';

  dataTable.clear();

  var yrs = _.map(years,function(o){return String(o).substr(2,2)});
  var td = ['<td>' + '<button type="button" class="btn btn-default btn-sm margin-bottom"><span class="glyphicon glyphicon-plus-sign aqua"></span> New query</button></div><br>Click above to look for seasonal trends at a particular location.' + '</td>'];
  _.each(intervals,function(i) {
    var vals = _.map(years,function(o){return Math.round(o / 10 * Math.random() * 10) / 10});
    var img = 'img/blank.png';
    if (_.indexOf($('#intervals select').selectpicker('val'),i) >= 0) {
      img = 'https://chart.googleapis.com/chart?chxt=x,y&cht=bvs&chd=t:' + vals.join(',') + '&chds=' + (_.min(vals) * 0.85) + ',' + (_.max(vals) * 1.15) + '&chco=a9d2dc&chs=150x150&chxl=0:|' + yrs.join('|') + '&chxs=0,808080,12,0,_|1,000000,0,0,_&chm=N,333333,0,,9&chbh=15';
    }
    td.push('<td><img width=150 height=150 src="' + img + '"></td>'); 
  });
  dataTable.row.add(td).draw();

  _.each(years,function(y) {
    var td = ['<td><b>' + y + '</b></td>'];
    _.each(intervals,function(i) {
      var p = catalog.model.getMap(v,depth,y,i);
      currentRange.v = customRange ? customRange : p.COLORSCALERANGE.split(',');
      currentRange.f = p.colorconversion;
      currentRange.inv = p.colorinversion;
      var u = makeGetMapUrl(p,bbox,600,customRange);
      if (_.indexOf($('#intervals select').selectpicker('val'),i) < 0) {
        u.fg = 'img/blank.png';
      }
      td.push('<td><a href="' + u.fg + '" data-toggle="lightbox" data-gallery="multiimages" data-parent="#dataTable" data-type="image" data-footer="Click left or right to move to the neighboring slide." data-title="' + i + ' ' + y + '"><img width=150 height=150 src="img/loading.gif"><img style="display:none" width=150 height=150 src="' + u.fg + '" onload="imgLoaded(this)"></a></td>');
      legend = 'img/' + p.legend + '.png';
    });
    dataTable.row.add(td).draw();
  });

  $('#legend-labels').css('background-image','url(' + legend + ')');
  var uom = _.findWhere(catalog.variables,{name : v}).uom;
  uom = uom ? '<br>(' + uom + ')' : '';
  $('#legend #text').html('<b>' + v + uom + '<br>from ' + catalog.model.name + '</b>');

  $('#legend-labels').empty();
  var dr = (Number(currentRange.v[1]) - Number(currentRange.v[0])) / 5;
  for (var i = 0; i <= 5; i++) {
    var v = currentRange.f(Number(currentRange.v[0]) + i * dr);
    if (currentRange.f(Number(currentRange.v[0]) + 5 * dr) - currentRange.f(Number(currentRange.v[0]) + 0 * dr) <= 4) {
      v = Math.round(v * 100) / 100;
    }
    else {
      v = Math.round(v);
    }
    $('#legend-labels').append('<span style="left:' + (13 + i * 71) + 'px">' + v + '</span>');
  }
}

function makeGetMapUrl(p,bbox,size,customRange) {
  // figure out the lats based on the bbox lon's & size
  var ratio = (Number(bbox[2]) - Number(bbox[0])) / size;
  var dLat  = ratio * size - Number(bbox[3]) + Number(bbox[1]);
  bbox[1] = Number(bbox[1]) - dLat / 2; 
  bbox[3] = Number(bbox[3]) + dLat / 2;

  var fg = OpenLayers.Util.urlAppend(
     p['url']
    ,OpenLayers.Util.getParameterString({
       LAYERS          : p['LAYERS']
      ,STYLES          : p['STYLES']
      ,COLORSCALERANGE : customRange ? customRange.join(',') : p['COLORSCALERANGE']
      ,ELEVATION       : p['ELEVATION']
      ,TIME            : p['TIME']
      ,WIDTH           : size
      ,HEIGHT          : size
      ,BBOX            : bbox.join(',')
      ,TRANSPARENT     : true
      ,FORMAT          : 'image/png'
      ,SERVICE         : 'WMS'
      ,VERSION         : '1.1.1'
      ,REQUEST         : 'GetMap'
      ,SRS             : 'EPSG:3857'
    })
  );

  var bm = OpenLayers.Util.urlAppend(
     'http://nowcoast.noaa.gov/wms/com.esri.wms.Esrimap/geolinks'
    ,OpenLayers.Util.getParameterString({
       LAYERS          : 'world_countries,world_rivers,world_lakes,us_canada_back,great_lakes'
      ,STYLES          : ''
      ,WIDTH           : size
      ,HEIGHT          : size
      ,BBOX            : bbox.join(',')
      ,TRANSPARENT     : true
      ,FORMAT          : 'image/png'
      ,SERVICE         : 'WMS'
      ,VERSION         : '1.1.1'
      ,REQUEST         : 'GetMap'
      ,SRS             : 'EPSG:3857'
    })
  );

  return {fg : fg,bm : bm};
}

window.onresize = resizeAll;
