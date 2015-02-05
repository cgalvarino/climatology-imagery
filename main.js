var prevPoint;
var plotData = [];
var lyrBbox;
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
  $('#verbiageCustomCoordinates').html(verbiage.customCoordinates);
  $('#verbiageResultsTitle').html(verbiage.resultsTitle);

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

  _.each(_.map(catalog.intervals.labels,function(o){return o[0]}),function(o) {
    var selected = defaults.intervals.indexOf(o) >= 0 ? 'selected="selected"' : '';
    $('#intervals select').append('<option value="' + o + '" ' + selected + '>' + o + '</option> ');
  });
  $('#intervals').change(function() {
    for (var i = 0; i < _.map(catalog.intervals.labels,function(o){return o[0]}).length; i++) {
      dataTable.column(i + 1).visible(_.indexOf($('#intervals select').selectpicker('val'),_.map(catalog.intervals.labels,function(o){return o[0]})[i]) >= 0);
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
          if (lyrBbox.features.length > 0) {
            var bounds = lyrBbox.getDataExtent().clone().transform(proj3857,proj4326).toArray();
            $('#customMinLon').val(Math.round(bounds[0] * 10000) / -10000);
            $('#customMinLat').val(Math.round(bounds[1] * 10000) / 10000);
            $('#customMaxLon').val(Math.round(bounds[2] * 10000) / -10000);
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
          lyrBbox.removeAllFeatures();
          var f = new OpenLayers.Feature.Vector(
            new OpenLayers.Bounds($('#customMinLon').val() * -1,$('#customMinLat').val(),$('#customMaxLon').val() * -1,$('#customMaxLat').val()).toGeometry().transform(proj4326,proj3857)
          );
          lyrBbox.addFeatures([f]);
          map.zoomToExtent(f.geometry.getBounds());
          $('#location').selectpicker('val','custom');
          $('#coords').modal('hide');
          query(currentRange.v.slice());
        })
        .modal('show');
    }
    else {
      lyrBbox.removeAllFeatures();
      var f = _.find(lyrCatalog.features,function(o){return o.attributes.name == val});
      if (f) {
        lyrBbox.addFeatures([f.clone()]);
        map.zoomToExtent(f.geometry.getBounds());
        query(currentRange.v.slice());
      }
      $('#location').selectpicker('val','custom');
    }
  });

  $('.selectpicker').selectpicker({width : 200});

  var th = [];
  _.each(['Year'].concat(_.map(catalog.intervals.labels,function(o){return o[0]})),function(o) {
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
  lyrBbox = new OpenLayers.Layer.Vector(
     'AOI'
    ,{styleMap : new OpenLayers.StyleMap({
       'default'   : style
      ,'select'    : style
    })}
  );
  lyrBbox.events.register('featureadded',this,function(e) {
    ctlBox.deactivate();
    query(currentRange.v ? currentRange.v.slice() : null);
  });

  var bm = new OpenLayers.Layer.ArcGIS93Rest(
     "ESRI Street World"
    ,"http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/export"
  );
  bm.params.FORMAT = "jpg";

  var style = new OpenLayers.Style(
    OpenLayers.Util.applyDefaults({
       pointRadius       : 8
      ,strokeColor       : '#000000'
      ,strokeOpacity     : 0.8
      ,fillColor         : '#ff0000'
      ,fillOpacity       : 0.8
    })
  );
  lyrQuery = new OpenLayers.Layer.Vector(
     'Query points'
    ,{styleMap : new OpenLayers.StyleMap({
       'default' : style
      ,'select'  : style
    })}
  );

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
      ,lyrBbox
      ,lyrQuery
    ]
    ,projection : proj3857
  });
  setTimeout(function() {
    map.zoomToExtent(new OpenLayers.Bounds(-101,13,-68,40).transform(proj4326,proj3857));
  },100);

  map.events.register('click',this,function(e) {
    lyrQuery.removeAllFeatures();
    var lonLat = map.getLonLatFromPixel(e.xy);
    var f = new OpenLayers.Feature.Vector(
      new OpenLayers.Geometry.Point(lonLat.lon,lonLat.lat)
    );
    lyrQuery.addFeatures([f]);
    query(currentRange.v.slice());
  });

  ctlBox = new OpenLayers.Control.DrawFeature(lyrBbox,OpenLayers.Handler.RegularPolygon);
  ctlBox.handler.setOptions({irregular : true});
  map.addControl(ctlBox);
  ctlBox.events.register('activate',this,function(e) {
    lyrBbox.removeAllFeatures();
  });

  var f = wkt.read(defaults.queryPt);
  f.geometry.transform(proj4326,proj3857);
  lyrQuery.addFeatures([f.clone()]);

  var f = _.find(lyrCatalog.features,function(o) {
    return o.attributes.name == defaults.site;
  });
  lyrBbox.addFeatures([f.clone()]);
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
  if (a.length == _.map(catalog.intervals.labels,function(o){return o[0]}).length) {
    return 'ALL';
  }
  else {
    return a.length > 0 ? a.join(', ') : 'Nothing selected';
  }

  // The following code may be used if dealing w/ intervals other than seasons.
  var aBands = [];
  _.each(a,function(o) {
    if (aBands.length > 0 && aBands[aBands.length - 1][aBands[aBands.length - 1].length - 1] == _.map(catalog.intervals.labels,function(o){return o[0]})[_.indexOf(_.map(catalog.intervals.labels,function(o){return o[0]}),o) - 1]) {
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
  var intervals = _.map(catalog.intervals.labels,function(o){return o[0]});
  var bbox      = lyrBbox.getDataExtent().toArray();
  var legend    = 'img/blank.png';

  var geom = lyrQuery.features[0].geometry.clone().transform(proj3857,proj4326);
  var lon  = geom.x;
  var lat  = geom.y;

  dataTable.clear();

  var td = ['<td>' + '<b>Query location<br><span id="queryCoords"></span></b><br>' + '<img class="query-marker" width=19 height=18 src="img/red_dot.png">' + '<br>Click anywhere on the map to change.</td>'];
  _.each(intervals,function(i) {
    var img = {id : 'foo',src: 'img/blank.png'};
    if (_.indexOf($('#intervals select').selectpicker('val'),i) >= 0 && years) {
      img = {
         id  : [v,depth,lon,lat,i].join('-')
        ,src : 'img/loading.gif'
      };
    }
    td.push('<td><img id="' + img.id + '" width=150 src="' + img.src + '"></td>'); 
  });
  dataTable.row.add(td).draw();

  $('#queryCoords').html([
     (Math.round(lat * 100) / 100) + ' N'
    ,(Math.round(lon * 100) / -100) + ' W'
  ].join(' '));

  var getObs = catalog.model.getObs(v,depth,lon,lat);
  $.ajax({
     url       : getObs.u
    ,v         : getObs.v
    ,vstr      : v
    ,uom       : _.findWhere(catalog['variables'],{name : v}).uom
    ,depth     : depth
    ,lon       : lon
    ,lat       : lat
    ,years     : years 
    ,intervals : _.intersection(intervals,$('#intervals select').selectpicker('val'))
    ,error   : function() {
      var that = this;
      _.each(that.intervals,function(i) {
         var id = [that.vstr,that.depth,that.lon,that.lat,i].join('-');
         $('[id="' + id + '"]').attr(
            'src'
           ,'img/warning.png'
         );
      });
    }
    ,success : function(r) {
      var charts = [];
      var data = processData($(r),this.v,this.uom,this.vstr,this.depth,this.lon,this.lat,this.years);
      _.each(this.intervals,function(i) {
        // find the bucket
        var idx = _.find(catalog.intervals.labels,function(o){return o[0] == i})[1];
        // pull out the data from the year(s) of interest
        var d = _.map(
          _.filter(data.data[idx],function(o){return _.indexOf(data.years,String(o[0].getFullYear())) >= 0})
          ,function(o){return Math.round(o[1] * 10) / 10}
        );
        var id = [data.vstr,data.depth,data.lon,data.lat,i].join('-');
        charts.push([id,d]);
      });
      var allVals = _.flatten(_.map(charts,function(o){return o[1]}));
      var minVal  = _.min(allVals);
      var maxVal  = _.max(allVals);
      var yrsStr  = _.map(data.years,function(o){return String(o).substr(2,2)});
      _.each(charts,function(o) {
        $('[id="' + o[0] + '"]').attr(
           'src'
          ,'https://chart.googleapis.com/chart?chxt=x,y&cht=bvs&chd=t:'
            + o[1].join(',')
            + '&chds=' + (minVal * 0.85) + ',' + (maxVal * 1.15)
            // supporting up to 12 custom colors
            + '&chco=8dd3c7|ffffb3|bebada|fb8072|80b1d3|fdb462|b3de69|fccde5|d9d9d9|bc80bd|ccebc5|ffed6f'
            + '&chs=150x150&chxl=0:|' + yrsStr.join('|')
            + '&chxs=0,808080,12,0,_|1,000000,0,0,_&chm=N,333333,0,,9&chbh=16'
        );
      });
    }
  });

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
      td.push('<td><a href="' + u.fg + '" data-toggle="lightbox" data-gallery="multiimages" data-parent="#dataTable" data-type="image" data-footer="Click left or right to move to the neighboring slide." data-title="' + i + ' ' + y + '"><img width=150 src="img/loading.gif"><img style="display:none" width=150 src="' + u.fg + '" onload="imgLoaded(this)"></a></td>');
      legend = 'img/' + p.legend + '.png';
    });
    dataTable.row.add(td).draw();
  });

  $('#legend-labels').css('background-image','url(' + legend + ')');
  var uom = _.findWhere(catalog.variables,{name : v}).uom('static');
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
  var w = size;
  var h = size;
  var dLat = Number(bbox[3]) - Number(bbox[1]);
  var dLon = Number(bbox[2]) - Number(bbox[0]);

  if (dLat > dLon) {
    w = dLon * h / dLat;
  }
  else if (dLat < dLon) {
    h = dLat * w / dLon; 
  }

  var fg = OpenLayers.Util.urlAppend(
     p['url']
    ,OpenLayers.Util.getParameterString({
       LAYERS          : p['LAYERS']
      ,STYLES          : p['STYLES']
      ,COLORSCALERANGE : customRange ? customRange.join(',') : p['COLORSCALERANGE']
      ,ELEVATION       : p['ELEVATION']
      ,TIME            : p['TIME']
      ,WIDTH           : Math.round(w)
      ,HEIGHT          : Math.round(h)
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

function processData($xml,v,uom,vstr,depth,lon,lat,years) {
  var d = {
     data  : []
    ,vstr  : vstr
    ,depth : depth
    ,lon   : lon
    ,lat   : lat
    ,years : years
  };
  var ncss = $xml.find('point');
  if (ncss.length > 0) { // NetcdfSubset response
    ncss.each(function() {
      var point = $(this);
      var u     = point.find('[name=' + v + ']').attr('units');
      d.uom = uom(u).label;
      var t = point.find('[name=date]').text();
      d.data.push([
         isoDateToDate(t)
        ,uom(u,point.find('[name=' + v + ']').text()).value
      ]);
    });
  }

  d.data = _.groupBy(d.data,function(o) {
    return catalog.intervals.fromDate(o[0]);
  });

  return d; 
}

function isoDateToDate(s) {
  // 2010-01-01T00:00:00 or 2010-01-01 00:00:00
  s = s.replace("\n",'');
  var p = s.split(/T| /);
  if (p.length == 2) {
    var ymd = p[0].split('-');
    var hm = p[1].split(':');
    return new Date(Date.UTC(
       ymd[0]
      ,ymd[1] - 1
      ,ymd[2]
      ,hm[0]
      ,hm[1]
    ));
  }
  else {
    return false;
  }
}

function getSnapshot() {
  // this is a helper function to simply list all the images in the matrix
  var img = [];
  $.each($('#dataTable img'),function() {
    if ($(this).attr('src').indexOf('tds') >= 0) {
      img.push($(this).attr('src'));
    }
  })
  $('#intro').html(img.join(' '));
}

window.onresize = resizeAll;
