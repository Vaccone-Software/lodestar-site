#!/bin/bash
# Maple Mono, fetched at build when absent (the repo commits the fonts;
# payload-only deploys arrive without them and pick them up here).
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f public/fonts/MapleMono-Regular.woff2 ]; then
    echo "fonts present"
    exit 0
fi
mkdir -p public/fonts
curl -sL -o /tmp/maple.zip https://github.com/subframe7536/maple-font/releases/download/v7.9/MapleMono-Woff2.zip
unzip -o -q /tmp/maple.zip -d /tmp/maple
for w in Regular Medium Bold; do
    cp "/tmp/maple/MapleMono-$w.ttf.woff2" "public/fonts/MapleMono-$w.woff2"
done
cp /tmp/maple/LICENSE.txt public/fonts/LICENSE.txt
echo "fonts fetched"
