#SECOORA CLIMATOLOGY IMAGERY ANALYSIS

With the help of the SECOORA product committee members, the Ocean Observing and Modeling Group at NCSU, and the SECOORA DMAC team, we are pleased to announce the release of the SECOORA Climatology Imagery Analysis product.  This release allows users to interact with historical modeled surface temperature and salinity fields from 2004 - 2010.  We hope that it will serve as a launching pad for further development, including the addition of more model outputs, and perhaps foster discussion to determine other ways historical data may be shared in a meaningful way with the ocean community.

##Architecture
The THREDDS data sources for this application are defined in `catalog.js`.  This file also defines the temporal and variable options as well as the initial application state.

This application relies on WMS availabity of modeled data sources for map images as well as NetCDF Subset Services for point extraction.

##Feedback
It is our hope that this application is forked and proves useful for ocean enthusiasts at large.  We welcome your feedback, and feel free to add issues here on GitHub.  If you prefer to contact the SECOORA team directly, email [communications@secoora.org](mailto:communications@secoora.org).
