# DiSky Atlas docs

The hand-written documentation of [DiSky Atlas](https://atlas.disky.me), the syntax reference of the
DiSky Skript addon. The atlas itself is generated from the plugin; this repository holds the guides
that explain how to use it.

## Layout

```text
docs.json              site configuration (untranslatable sections)
en/<section>/<page>.md source pages, in English
<code>/locale.json     one folder per translation (for example fr/)
<code>/<section>/...   translated pages, at the same relative path as the English page
assets/<section>/...   images, shared by every language
```

Each folder of `en/` is a section, and `en/<section>/index.md` describes the section. A page is one
markdown file; its frontmatter sets the title, icon, description and order.

## Contributing

- [Setup](en/contributing/setup.md): previewing the site locally against this repository.
- [Writing pages](en/contributing/writing-pages.md): file layout, frontmatter and components.
- [Style guide](en/contributing/style-guide.md): how a topic page is structured and worded.
- [Translating](TRANSLATING.md): how to add or update a translation, and the glossary to use.

## Publishing

A push to `main` goes live automatically once the CI lint passes. The site syncs from this repository
on each push (GitHub webhook, with a poll every 10 minutes as a fallback); the application does not
need a rebuild.

## License

TBD.
