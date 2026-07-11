/**
 * PostCSS config.
 *
 * The provided design ships its own stylesheet stack
 * (bootstrap.min.css + common.css + main.css + responsive.css) which we
 * link directly from /public/assets. We intentionally do NOT pull in Tailwind's
 * preflight/base here: injecting it would reset/override the provided design
 * and break pixel fidelity. All custom component styling lives in
 * app/globals.css as plain CSS.
 */
const config = {
  plugins: {},
};

export default config;
