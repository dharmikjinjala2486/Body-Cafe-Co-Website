# QA scripts for directions E–H

Run the preview server on port 4174 first (`python3 app/server.py --port 4174 --db /tmp/preview.sqlite3`).
Set the Chromium path in each script if yours differs from `/opt/pw-browsers/...`.

- `verify.py e,f,g,h 320,390,768,1100,1440` — every customer route and every fixture state from `BCCSite.states`: horizontal overflow, one `h1`, E–H wrapper present, console and page errors.
- `flows.py e,f,g,h` — end to end at 1440 and 390: menu, header links, add from home, curiosity tabs by keyboard, home lot lookup, filter and sort, product page quantity + add, pincode, product lot lookup, bag quantity and remove, checkout → payment → paid order, OTP sign-in, support case, search dialog, lot-report picker and match.
- `shots.py <out> e,f,g,h` — full-page desktop (1440) and mobile (390 @2x) screenshots of 23 routes plus the menu or search dialog.

The `DEMO-OUTAGE` report state logs one expected 503 in the console.
