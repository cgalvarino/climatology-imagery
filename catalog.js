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
    'CRCOOS' : {
      'CAP2' : {
        'wkt' : 'POINT(-79.62 32.8)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'http://mmisw.org/ont/cf/parameter/sea_water_temperature'
            ,'Salinity'    : 'http://mmisw.org/ont/cf/parameter/sea_water_salinity'
          };
          return {
            u : 'http://tds.secoora.org/thredds/sos/carocoops.cap2.buoy_archive.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;subtype%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + vh[v]
            ,y : [year0,year1]
          };
        }
        ,'descr' : {name : 'the CAP2 buoy, part of the CRCOOS network',freq : 'one observation per hour'}
      }
      ,'FRP2' : {
        'wkt' : 'POINT(-80.4 32.27)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'http://mmisw.org/ont/cf/parameter/sea_water_temperature'
            ,'Salinity'    : 'http://mmisw.org/ont/cf/parameter/sea_water_salinity'
          };
          return {
            u : 'http://tds.secoora.org/thredds/sos/carocoops.frp2.buoy_archive.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;subtype%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + vh[v]
            ,y : [year0,year1]
          };
        }
        ,'descr' : {name : 'the FRP2 buoy, part of the CRCOOS network',freq : 'one observation per hour'}
      }
      ,'SUN2' : {
        'wkt' : 'POINT(-78.48 33.83)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'http://mmisw.org/ont/cf/parameter/sea_water_temperature'
            ,'Salinity'    : 'http://mmisw.org/ont/cf/parameter/sea_water_salinity'
          };
          return {
            u : 'http://tds.secoora.org/thredds/sos/carocoops.sun2.buoy_archive.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;subtype%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + vh[v]
            ,y : [year0,year1]
          };
        }
        ,'descr' : {name : 'the SUN2 buoy, part of the CRCOOS network',freq : 'one observation per hour'}
      }
    }
    ,'COMPS' : {
       'C10' : {
        'wkt' : 'POINT(-82.92 27.169)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'http://mmisw.org/ont/cf/parameter/sea_water_temperature'
            ,'Salinity'    : 'http://mmisw.org/ont/cf/parameter/sea_water_salinity'
          };
          return {
            u : 'http://tds.secoora.org/thredds/sos/usf.c10.mcat_2011.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;subtype%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + vh[v]
            ,y : [year0,year1]
          };
        }
        ,'descr' : {name : 'the C10 buoy, part of the COMPS network',freq : 'three observations per hour which are averaged.  This hourly average is being used to populate the graph.'}
      }
      ,'C12' : {
        'wkt' : 'POINT(-83.721 27.498)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'http://mmisw.org/ont/cf/parameter/sea_water_temperature'
            ,'Salinity'    : 'http://mmisw.org/ont/cf/parameter/sea_water_salinity'
          };
          return {
            u : 'http://tds.secoora.org/thredds/sos/usf.c12.mcat_2011.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;subtype%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + vh[v]
            ,y : [year0,year1]
          };
        }
        ,'descr' : {name : 'the C12 buoy, part of the COMPS network',freq : 'three observations per hour which are averaged.  This hourly average is being used to populate the graph.'}
      }
      ,'C13' : {
        'wkt' : 'POINT(-83.073 26.063)'
        ,'getObs' : function(v,year0,year1) {
          var vh = {
             'Temperature' : 'http://mmisw.org/ont/cf/parameter/sea_water_temperature'
            ,'Salinity'    : 'http://mmisw.org/ont/cf/parameter/sea_water_salinity'
          };
          return {
            u : 'http://tds.secoora.org/thredds/sos/usf.c13.mcat_2011.nc?request=GetObservation&service=SOS&version=1.0.0&responseFormat=text/xml;subtype%3D"om/1.0.0"&offering=urn:ioos:network:org.secoora:all&procedure=urn:ioos:network:org.secoora:all' + '&eventTime=' + year0 + '-01-01T00:00:00Z/' + year1 + '-12-31T23:59:59Z' + '&observedProperty=' + vh[v]
            ,y : [year0,year1]
          };
        }
        ,'descr' : {name : 'the C13 buoy, part of the COMPS network',freq : 'three observations per hour which are averaged.  This hourly average is being used to populate the graph.'}
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
   'year' : 2011
  ,'var'  : 'Temperature'
  ,'site' : 'C10'
  ,'avg'  : 'Day'
  ,'src'  : 'Buoy'
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
