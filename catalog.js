var catalog = {
   'years'     : [2004,2005,2006,2007,2008,2009,2010]
  ,'intervals' : {
    labels     : [
       ['Winter',11]
      ,['Spring',02]
      ,['Summer',05]
      ,['Fall'  ,08]
    ]
    ,fromDate : function(d) {
      return d.getUTCMonth() + 1; 
    }
  }
  ,'variables' : [
    {
       name : 'Temperature'
      ,uom  : function(u,o) { 
        if (u == 'static') {
          return '&deg;F';
        }
        if (/celsius/i.test(u)) {
          return {label : 'Fahrenheit',value : o * 1.8 + 32};
        }
        else {
          return {label : u,value : o};
        }
      }
    }
    ,{
       name : 'Salinity'
      ,uom  : function(u,o) {
        if (u == 'static') {
          return false;
        } 
        else {
          return {label : u,value : o};
        }
      }
    }
  ]
  ,'sites' : {
    'Regional shortcuts' : {
      'SECOORA' : {
        'wkt' : 'POLYGON((-101 13,-68 13,-68 40,-101 40,-101 13))'
      }
      ,'Gulf of Mexico' : {
        'wkt' : 'POLYGON((-98.5 22.5,-79.5 22.5,-79.5 31.75,-98.5 31.75,-98.5 22.5))'
      }
    }
  }
  ,'model' : {
     name   : 'SABGOM'
    ,getObs : function(v,d,lon,lat) {
      var layer;
      switch(v) {
        case 'Temperature' : layer = 'temperature'; break;
        case 'Salinity'    : layer = 'salinity'; break;
      }

      var elevation;
      switch(d) {
        case 'Sea surface' : elevation = 'surface'; break;
        case 'Sea floor'   : elevation = 'bottom'; break;
      }

      return {
         u : 'http://129.252.139.124/thredds/ncss/sabgom_3_month_avg_by_year/' + layer + '_' + elevation + '_year.nc?var=' + layer + '&latitude=' + lat + '&longitude=' + lon + '&time_start=2004-02-15T00:00:00Z&time_end=2010-11-15T00:00:00Z&accept=xml'
        ,v : layer
      };
    }
    ,getMap : function(v,d,year,interval) {
      var layer;
      switch(v) {
        case 'Temperature' : layer = 'temperature'; break;
        case 'Salinity'    : layer = 'salinity'; break;
      }

      var tds_layer;
      switch(v) {
        case 'Temperature' : tds_layer = 'temp'; break;
        case 'Salinity'    : tds_layer = 'salinity'; break;
      }

      var dt = year + '-';
      switch(interval) {
        case 'Winter' : dt += '11-15'; break;
        case 'Spring' : dt += '02-15'; break;
        case 'Summer' : dt += '05-15'; break;
        case 'Fall'   : dt += '08-15'; break;
      }

      var elevation;
      switch(d) {
        case 'Sea surface' : elevation = 'surface'; break;
        case 'Sea floor'   : elevation = 'bottom'; break;
      }

      var colorscalerange = {
         'Temperature' : {'Sea surface' : '10,33','Sea floor' : '0,33'}
        ,'Salinity'    : {'Sea surface' : '32,37','Sea floor' : '32,37'}
      };

      var colorconversion = {
         'Temperature' : function(v) {return Number(v) * 9/5 + 32}
        ,'Salinity'    : function(v) {return Number(v)}
      };

      var colorinversion = {
         'Temperature' : function(v) {return (Number(v) - 32) / 1.8}
        ,'Salinity'    : function(v) {return Number(v)}
      };

      return {
         LAYERS          : layer
        ,STYLES          : 'boxfill/rainbow'
        ,COLORSCALERANGE : colorscalerange[v][d]
        ,TIME            : dt
        ,url             : 'http://tds.secoora.org/ncWMS/wms?LAYERS=sabgom_clim_' + tds_layer + '_' + elevation + '_year/' + layer
        ,legend          : 'boxfill-rainbow'
        ,colorconversion : colorconversion[v]
        ,colorinversion  : colorinversion[v]
      };
    }
    ,'descr' : {name : 'the SABGOM forecasting model',freq : 'once every three hours and a grid size of 5km'}
  }
};

var defaults = {
   'intervals' : ['Winter','Spring','Summer','Fall']
  ,'years'     : [2004,2005]
  ,'var'       : 'Temperature'
  ,'site'      : 'SECOORA'
  ,'queryPt'   : 'POINT(-83 25)'
  ,'depth'     : 'Sea surface'
};

var verbiage = {
  'modelTT' : {
     a    : 'model&nbsp;results'
    ,info : 'North Carolina State University\'s Regional Scale Ocean Model:  South Atlantic Bight Gulf of Mexico (SABGOM)'
  }
  ,'customCoordinates' : 'The SABGOM model domain is 13-40 latitude (degrees North) and 101-68 longitude (degrees West).'
  ,'resultsTitle' : 'SECOORA SABGOM 2004-2010 Hindcast Model Seasonal Climatologies'
};
