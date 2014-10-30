var prevPoint;
var plotData = [];
var lyrQuery;
var ctlBox;
var lyrCatalog = new OpenLayers.Layer.Vector();
var map;
var spinner;
var proj3857 = new OpenLayers.Projection("EPSG:3857");
var proj4326 = new OpenLayers.Projection("EPSG:4326");

function init() {
  $('#buoyTT').html(verbiage.buoyTT.a);
  $('#buoyTT').tooltip().attr('data-original-title',verbiage.buoyTT.info).tooltip('fixTitle');
  $('#modelTT').html(verbiage.modelTT.a);
  $('#modelTT').tooltip().attr('data-original-title',verbiage.modelTT.info).tooltip('fixTitle');

  $('#coords .btn-default').on('click',function() {
    $('#location').selectpicker('val','custom');
    $('#coords').modal('hide');
  });

  $('#new-box-button button').on('click',function() {
    $(this).blur();
    ctlBox.activate();
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
    query();
  });

  _.each(catalog.years.sort(),function(o) {
    var selected = defaults.years.indexOf(o) >= 0 ? 'selected="selected"' : '';
    $('#years select').append('<option value="' + o + '" ' + selected + '>' + o + '</option> ');
  });
  $('#years').change(function() {
    query();
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
          query();
        })
        .modal('show');
    }
    else {
      lyrQuery.removeAllFeatures();
      var f = _.find(lyrCatalog.features,function(o){return o.attributes.name == val});
      if (f) {
        lyrQuery.addFeatures([f.clone()]);
        map.zoomToExtent(f.geometry.getBounds());
        query();
      }
      $('#location').selectpicker('val','custom');
    }
  });

  $('.selectpicker').selectpicker({width : 200});

  resizeAll();

  var style = new OpenLayers.Style(
    OpenLayers.Util.applyDefaults({
       pointRadius       : 6
      ,strokeColor       : '#0000ff'
      ,strokeOpacity     : 0.8
      ,fillColor         : '#0000ff'
      ,fillOpacity       : 0.2
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
  });

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

function niceString(a) {
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
  $('#map').height($(window).height() - $('#title').height() - $('#locations').position().top - $('#map').position().top - 40);
  map && map.updateSize();
}

function resizeAll() {
  var fixedHeightBelowGraph = 120;
  $('#resultsWrapper').height($(window).height() - $('#title').height() - $('#resultsWrapper').position().top - 24);
  $('#time-series-graph').height($('#resultsWrapper').height() - $('#time-series-graph').position().top + $('#resultsWrapper').position().top - fixedHeightBelowGraph);
  resizeMap();
}

function query() {
  return;
}

window.onresize = resizeAll;
