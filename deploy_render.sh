#!/bin/bash
# Render deployment script

RENDER_KEY="rnd_nr9sf2Vzy8Dz1LaNO69Oa2n5dJAr"

curl -s -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_KEY" \
  -H "Content-Type: application/json" \
  -d @render_payload.json
