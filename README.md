# muenstererOS

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Env variables for Algolia Zettelkasten search:

```
PUBLIC_ALGOLIA_API_ID=
PUBLIC_ALGOLIA_API_KEY=
```

### Changelog

After making a major change, add an entry to [changes.json](./src/data/changes.json) in this format:

```json
{
    "date": "yyyy-MM-dd",
    "title": "Name of Change",
    "description": "Short description of what was changed.",
    "path": "/path-to-page"
},
```

Save the file and run `npm run xml` to generate the updated feed.
