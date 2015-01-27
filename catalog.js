var catalog = {
   'years'     : [2004,2005,2006,2007,2008,2009,2010]
  ,'intervals' : ['Winter','Spring','Summer','Fall']
  ,'variables' : [
    {
       name : 'Temperature'
      ,uom  : 'degrees Fahrenheit'
    }
    ,{
       name : 'Salinity'
      ,uom  : false
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
        case 'Temperature' : layer = 'temperature'; break;
        case 'Salinity'    : layer = 'salinity'; break;
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
         'Temperature' : {'Sea surface' : '10,31','Sea floor' : '0,31'}
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
        ,url             : 'http://129.252.139.124/thredds/wms/sabgom_3_month_avg_by_year/' + layer + '_' + elevation + '_year.nc'
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
  ,'years'     : [2004]
  ,'var'       : 'Temperature'
  ,'site'      : 'SECOORA'
  ,'depth'     : 'Sea surface'
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
