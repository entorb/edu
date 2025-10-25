#!/bin/sh

# ensure we are in the root dir
script_dir=$(cd $(dirname $0) && pwd)
cd $script_dir/..

pnpm run check && pnpm run build && rsync -rhv --delete --no-perms --ignore-times dist/ entorb@entorb.net:html/wordplay/
