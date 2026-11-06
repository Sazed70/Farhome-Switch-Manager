# Switch Manager Frontend

## Why a Rewrite?

The original frontend was a single ~5.2 MB obfuscated JavaScript bundle
(`switch_manager_panel.js`) that embedded **frozen copies** of Home Assistant
components (ha-automation-action, ha-service-control, ha-selector, etc.). Over many
HA releases those frozen components drifted from the live `hass` object and broke —
e.g. the action editor's dynamic pickers (the `input_select.select_option` "Option"
dropdown, and Targets for areas/devices/labels) stopped working.

## New Architecture (v4)

Instead of bundling frozen HA components, the panel now uses Home Assistant's
**current runtime components**, so the editor always matches the running HA version:

- The panel is registered with **`embed_iframe: False`** (see
  `custom_components/switch_manager/view.py`) so it runs in the **main document**,
  sharing the live `hass` (states + entity/device/area/label registries) and HA's
  dialog manager.
- HA's editor components are **loaded on demand at runtime** via
  [`@kipk/load-ha-components`](https://www.npmjs.com/package/@kipk/load-ha-components)
  (`loadHaComponents(...)` in `src/switch-manager-panel.ts`), which drives HA's
  config/automation route loader to register `ha-automation-action`,
  `ha-service-control`, `ha-selector`, `ha-yaml-editor`, etc.
- All **chrome** that HA no longer ships/auto-loads (the old `ha-app-layout`/
  `app-header`, `paper-tabs`, `ha-button-menu`, `ha-dialog`, `mwc-*`, `ha-textfield`,
  `ha-switch`) was replaced with small, self-contained, drift-proof components:
  `switch-manager-menu` (overflow menu), `switch-manager-dialog` (modal), a custom
  tab strip in `switch-manager-button-actions`, a custom toolbar, and native inputs.
- The bundle is built as an **ES module** (`rollup.config.mjs`, `format: "es"`) so HA
  can `import()` it for the non-iframe panel. It bundles only `lit` +
  `@kipk/load-ha-components` + our code (no HA components).

## Build Instructions

```bash
cd frontend
npm install
npm run build      # production ES-module bundle
npm run watch      # dev build with watch
```

The built file is output to `../custom_components/switch_manager/assets/switch_manager_panel.js`
and is committed to the repo (HA loads it directly). The `module_url` carries the
`manifest.json` version and a content hash of the bundle as cache-busters.

## Farhome Pulsanti panel

The default route loads the Lit components in `src/farhome/`. Rooms use
`/switch_manager/rooms/{area_id}`; `_no_area` and `_unassociated` are reserved
views. Device details add `/device/{device_id}`. The inherited index remains at
`/switch_manager/legacy`, with its original `/new/{blueprint}` and `/edit/{id}` routes.

All new transport goes through administrative, revision-checked WebSocket APIs.
The editor never calls load services. Quick forms replace only explicitly edited
gestures; unknown sequences stay in HA's runtime action editor. Metadata and native
helper edits are separate operations. The bundle includes no frozen HA editor.

Run `npm test`, `npx tsc --noEmit`, `npm run build`, then from the repository root
`python tests/browser/farhome_panel.py` and `python tests/browser/legacy_revision.py`.
Browser fixtures simulate only HA data/transport; they import the actual bundle.
Chrome Beta is auto-detected on Windows; CI can use Playwright Chromium or set
`FARHOME_BROWSER`. Screenshots are scratch evidence, not application assets.
