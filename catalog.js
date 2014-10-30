var catalog = {
   'years'     : [2011,2012,2013,2014]
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
    }
  }
  ,'models' : {
    'SABGOM' : {
      'getObs' : function(v,year,avg,lon,lat,stat) {
        var vh = {
           'Temperature' : ['temp','']
          ,'Salinity'    : ['salt','_salt']
        };
        var ah = {
           'Day'   : 'daily'
          ,'Month' : 'monthly'
        };
        var d = 'clim_' + ah[avg] + '_avg_surface';
        if (stat) {
          d    = 'clim_all_' + ah[avg] + '_' + stat + '_surface'
          year = '2018';
        }
        return {
          u : 'http://tds.secoora.org/thredds/ncss/grid/' + d + vh[v][1] + '.nc?var=' + vh[v][0] + '&latitude=' + lat + '&longitude=' + lon + '&time_start=' + year + '-01-01T00:00:00Z&time_end=' + year + '-12-31T23:59:59Z&accept=xml'
          ,v : vh[v][0]
        };
      }
      ,'wkt' : ''
      ,'descr' : {name : 'the SABGOM forecasting model',freq : 'once every three hours and a grid size of 5km'}
    }
  }
};

var defaults = {
   'years' : [2011,2012,2013,2014]
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
