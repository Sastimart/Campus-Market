# Campus Market

Local marketplace for hostel and PG students.

## Features

- Buy / Sell / Rent listings
- Categories
- Search
- Campus / hostel scope
- Cloudflare Workers backend
- D1 database
- R2 image storage
- Chat-ready backend structure

## Cloudflare Setup

1. Create a D1 database named `campus-market-db`.
2. Create an R2 bucket named `campus-market-images`.
3. Put the D1 database ID inside `wrangler.jsonc`.
4. Run the SQL in `schema.sql`.
5. Deploy with:

npm install
npx wrangler deploy
