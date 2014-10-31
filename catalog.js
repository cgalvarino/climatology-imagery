var catalog = {
   'years'     : [2011,2012,2013,2014]
  ,'intervals' : ['Winter','Spring','Summer','Fall']
  ,'variables' : [
    {
       name : 'Temperature'
      ,uom  : function(u,o) {
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
        return {label : u,value : o};
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
    ,getMap : function(v,d,year,interval) {
      var layer;
      switch(v) {
        case 'Temperature' : layer = 'temp'; break;
        case 'Salinity'    : layer = 'salt'; break;
      }

      var dt = year + '-';
      switch(interval) {
        case 'Winter' : dt += '10-01'; break;
        case 'Spring' : dt += '10-08'; break;
        case 'Summer' : dt += '10-15'; break;
        case 'Fall'   : dt += '10-23'; break;
      }

      var elevation;
      switch(d) {
        case 'Sea surface' : d = '-0.013888888888888888'; break;
        case 'Sea floor'   : d = '-0.986111111111111'; break;
      }

      return {
         LAYERS          : layer
        ,STYLES          : 'boxfill/rainbow'
        ,COLORSCALERANGE : '20,30'
        ,ELEVATION       : d
        ,TIME            : dt
        ,url             : 'http://omgsrv1.meas.ncsu.edu:8080/thredds/wms/fmrc/sabgom/SABGOM_Forecast_Model_Run_Collection_best.ncd'
      };
    }
    ,'descr' : {name : 'the SABGOM forecasting model',freq : 'once every three hours and a grid size of 5km'}
  }
};

var defaults = {
   'years' : [2014]
  ,'var'   : 'Temperature'
  ,'site'  : 'SECOORA'
  ,'depth' : 'Sea surface'
};

var verbiage = {
  'buoyTT' : {
     a    : 'SECOORA&nbsp;buoys'
    ,info : 'Three stations operated and maintained by University of North Carolina, Wilmington (CRCOOS); Three stations operated by the University of South Florida (USF)'
  }
  ,'modelTT' : {
     a    : 'model&nbsp;results'
    ,info : 'North Carolina State University\'s Regional Scale Ocean Model:  South Atlantic Bight Gulf of Mexico (SABGOM)'
  }
};
