const withCSS = require('@zeit/next-css');
const { copySync, removeSync } = require('fs-extra');
const { join, resolve } = require('path');
const semver = require('semver');

const { version } = require('./package.json');

// copy versions/v(latest version) to versions/latest
// (Next.js only half-handles symlinks)
const vLatest = join('pages', 'versions', `v${version}/`);
const latest = join('pages', 'versions', 'latest/');
removeSync(latest);
copySync(vLatest, latest);

module.exports = withCSS({
  trailingSlash: true,
  // Rather than use `@zeit/next-mdx`, we replicate it
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  webpack: (config, options) => {
    // Add preval support for `constants/*` only and move it to the `.next/preval` cache.
    // It's to prevent over-usage and separate the cache to allow manually invalidation.
    // See: https://github.com/kentcdodds/babel-plugin-preval/issues/19
    config.module.rules.push({
      test: /.jsx?$/,
      include: [resolve(__dirname, 'constants')],
      use: {
        ...options.defaultLoaders.babel,
        options: {
          ...options.defaultLoaders.babel.options,
          cacheDirectory: '.next/preval',
          plugins: ['preval'],
        },
      },
    })

    // Add support for MDX with our custom loader
    config.module.rules.push({
      test: /.mdx?$/, // load both .md and .mdx files
      use: [options.defaultLoaders.babel, '@mdx-js/loader', join(__dirname, './common/md-loader')],
    });

    // Fix inline or browser MDX usage: https://mdxjs.com/getting-started/webpack#running-mdx-in-the-browser
    config.node = { fs: 'empty' };

    return config;
  },
  async exportPathMap(defaultPathMap, { dev, dir, outDir }) {
    if (dev) {
      return defaultPathMap;
    }
    return Object.assign(
      ...Object.entries(defaultPathMap).map(([pathname, page]) => {
        if (pathname.match(/\/v[1-9][^\/]*$/)) {
          // ends in "/v<version>"
          pathname += '/index.html'; // TODO: find out why we need to do this
        }
        if (pathname.match(/unversioned/)) {
          return {};
        } else {
          // hide versions greater than the package.json version number
          const versionMatch = pathname.match(/\/v(\d\d\.\d\.\d)\//);
          if (versionMatch && versionMatch[1] && semver.gt(versionMatch[1], version)) {
            return {};
          }
          return { [pathname]: page };
        }
      })
    );
  },
});
