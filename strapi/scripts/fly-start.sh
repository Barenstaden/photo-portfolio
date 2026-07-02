#!/bin/sh
set -eu

mkdir -p /data/uploads
rm -rf /app/public/uploads
ln -s /data/uploads /app/public/uploads

exec npm start
