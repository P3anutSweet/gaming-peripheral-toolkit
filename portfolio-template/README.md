# Bilingual portfolio template

The one-page layout behind [portfolio.sunsetboulevard.ca](https://portfolio.sunsetboulevard.ca/): a fixed side index, a grid of project cards, numbered case files, a Q&A section and a contact band. English and Chinese live in the same file and switch with the EN / 中文 buttons.

## Use it

1. Download `index.html` and open it in a browser. No build step.
2. Replace every placeholder. Each piece of text has an English `<span class="en">` and a Chinese `<span class="zh">`; delete one of them everywhere if you only need one language.
3. Put your images in an `img/` folder next to the file and point the `src` attributes at them.
4. Change the palette in the `:root` block at the top of the `<style>`. Dark mode follows the visitor's system setting.
5. Host it anywhere static: GitHub Pages, Cloudflare Pages or Netlify.

## Make it findable

For search and AI answer engines, add a `robots.txt` that allows crawlers, a `sitemap.xml`, an `llms.txt` summary, and JSON-LD `Person` and `FAQPage` data in the `<head>`. View the source of portfolio.sunsetboulevard.ca for a working example.

Fonts: Instrument Sans, Fragment Mono and Noto Sans SC from Google Fonts, with system fallbacks.
