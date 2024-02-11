# emails-chromatic

This project provides visual regression testing of emails via Chromatic. It's
split out as a separate package from `emails` for a few reasons:

- Avoid mixing React and Svelte in a single project (I suspect they'd be
  fighting over TypeScript types).
- Ensure exports from `emails` can be imported and used in a SvelteKit project.)
