# design.med-o.de

The documentation site of the med.o Design System, live at [design.med-o.de](https://design.med-o.de). The site is built with the system itself: it installs `@med-o/ui` and `@med-o/design-tokens` from npm, the same way you do in your own app.

It is a Next.js app with the App Router and a static export. There is no server – the build writes plain files.

## Run it

You need Node 24 (see `.nvmrc`) and npm.

```bash
npm ci          # install the exact versions from package-lock.json
npm run dev     # start the dev server at http://localhost:3000
npm run build   # build the static site into out/
npm run lint    # ESLint without warnings, then the TypeScript check
```

`npm run build` writes the site to `out/`. Serve that folder with any static web server.
