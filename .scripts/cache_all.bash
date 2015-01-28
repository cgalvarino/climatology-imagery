#!/bin/bash

echo cache_all start `date`
if [ ! -f /tmp/lock_cache_all ]; then
  touch /tmp/lock_cache_all

  ./salinity_bottom.bash
  ./salinity_surface.bash
  ./temperature_bottom.bash
  ./temperature_surface.bash

  rm -f /tmp/lock_cache_all
fi
echo cache_all end `date`
