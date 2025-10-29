#!/bin/sh

# ensure we are in the root dir
script_dir=$(cd $(dirname $0) && pwd)
cd $script_dir/..

pnpm run check || exit 1

for app in 1x1 voc; do
  pnpm run build:$app && rsync -rhv --delete --no-perms --ignore-times apps/$app/dist/ entorb@entorb.net:html/$app/
done
