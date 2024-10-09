// @ts-check

/** @type {import('@yarnpkg/types')} */
const { defineConfig } = require("@yarnpkg/types");
const semver = require("semver");

/**
 * @typedef {import('@yarnpkg/types').Yarn.Constraints.Workspace} Workspace
 * @typedef {import('@yarnpkg/types').Yarn.Constraints.Dependency} Dependency
 * @typedef {import('@yarnpkg/types').Yarn.Constraints.Context} Context
 */

/**
 * This rule will enforce that a workspace MUST depend on the same version of
 * a dependency as the one used by the other workspaces.
 *
 * @param {Context} context
 */
function enforceConsistentDependenciesAcrossTheProject({ Yarn }) {
  for (const dependency of Yarn.dependencies()) {
    if (dependency.type === `peerDependencies`) continue;

    for (const otherDependency of Yarn.dependencies({
      ident: dependency.ident,
    })) {
      if (
        otherDependency.type === `peerDependencies` ||
        otherDependency.workspace === dependency.workspace
      )
        continue;

      dependency.update(otherDependency.range);
    }
  }
}

/**
 * Yarn constraint function that ensures all packages with a specific scope have
 * the same non-fuzzy version.
 *
 * @param {Context} ctx
 * @param {string} scope
 */
function enforceScopedDependencyVersions({ Yarn }, scope) {
  // Get all dependencies with the specified scope
  const scopedDependencies = Yarn.dependencies().filter((dependency) =>
    dependency.ident.startsWith(scope),
  );

  // Get the highest version of the scoped dependencies
  const highestVersion = scopedDependencies
    .map((dependency) => semver.minVersion(dependency.range))
    .filter((version) => version != null)
    .sort(semver.rcompare)[0]
    ?.toString();
  invariant(highestVersion != null);

  // Update all dependencies with the specified scope to the unique version
  for (const dependency of scopedDependencies) {
    dependency.update(highestVersion);
  }
}

/**
 * @param {boolean} condition
 * @returns {asserts condition}
 */
function invariant(condition) {
  if (!condition) {
    throw new Error(`invariant failed`);
  }
}

/**
 * This rule will enforce that `@types/<pkg>` dependencies are compatible with
 * the bare `<pkg>` dependency.
 *
 * It can be customized to allow more/less granular version matches, for example
 * `@types/react` should match the `major.minor` of `react`, but other packages
 * should just match the `major` because they're less maintained and have less
 * granular releases.
 *
 * @param {Context} ctx
 * @param {{ [identAtRange: string]: string }} [resolutions] Overrides e.g. `{
 * "eslint@^7": "~6.54.0" }` means allow `@types/eslint@~6.54.0` for `eslint@^7`
 */
function enforceStrictTypesCompatibility(ctx, resolutions = {}) {
  const { Yarn } = ctx;
  const unseen = new Set(Object.keys(resolutions));

  for (const dependency of Yarn.dependencies()) {
    if (dependency.type === `peerDependencies`) continue;
    if (dependency.ident.startsWith(`@types/`)) continue;

    for (const typesDependency of Yarn.dependencies({
      ident: typesPackageIdent(dependency.ident),
    })) {
      if (typesDependency.type === `peerDependencies`) continue;

      const identAtRange = `${dependency.ident}@${dependency.range}`;
      unseen.delete(identAtRange);

      let expectedTypesRange =
        resolutions[identAtRange] ?? rangeMatchingMinor(dependency.range);

      typesDependency.update(expectedTypesRange);
    }
  }

  // To avoid accidentally keeping cruft around after packages have been
  // updated, ensure that all rules were used.
  if (unseen.size > 0)
    reportRootError(
      ctx,
      `Unused enforceStrictTypesCompatibility(…, resolutions) keys: ${Array.from(unseen).join(",")}`,
    );
}

/**
 * Return the corresponding `@types/` package for a given package.
 *
 * @param {string} packageIdent
 */
function typesPackageIdent(packageIdent) {
  return `@types/${packageIdent.replace("/", "__").replace("@", "")}`;
}

/**
 * Return a semver range that matches the major and minor for a given range.
 *
 * @param {string} range
 */
function rangeMatchingMinor(range) {
  const version = semver.minVersion(range);
  if (version === null) {
    throw new Error(`Could not evalute semver.minVersion(${range})`);
  }
  // Using `1.1.x` style instead of `~1.1.0` because it's more intuitive. The
  // tilde rules are complicated (e.g. ~1.1.0 is different to ~1.1).
  return `${version.major}.${version.minor}.x`;
}

/**
 * @param {Context} context
 * @param {string} message
 */
function reportRootError({ Yarn }, message) {
  const rootWorkspace = Yarn.workspace({ cwd: "." });
  if (rootWorkspace === null) {
    throw new Error("Could not find root workspace");
  }
  rootWorkspace.error(message);
}

module.exports = defineConfig({
  async constraints(ctx) {
    await enforceConsistentDependenciesAcrossTheProject(ctx);
    await enforceScopedDependencyVersions(ctx, `@tamagui/`);
    await enforceStrictTypesCompatibility(ctx, {
      "color@^4.2.3": "^3",
      "eslint@^8.57.0": "^8",
      "jest@^29.7.0": "^29 <=29.7.x",
      "pg@^8.12.0": "^8 <=8.12.x",
      "ws@^8.17.1": "^8 <=8.17.x",
    });
  },
});
