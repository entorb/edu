#!/bin/sh

# ensure we are in the root dir
script_dir=$(cd $(dirname $0) && pwd)
cd $script_dir/..

# PNG: manually done via Inkscape UI instead
# Favicon: manually done via Gimp
# inkscape assets/icon.svg --export-filename=public/android-chrome-512.png -w 512 -h 512
# inkscape assets/icon.svg --export-filename=public/android-chrome-192.png -w 192 -h 192
# inkscape assets/icon.svg --export-filename=public/apple-touch-icon.png -w 180 -h 180
# https://favicon.io/favicon-converter/

# convert -background none assets/icon.svg -resize 512x512 public/android-chrome-512.png
