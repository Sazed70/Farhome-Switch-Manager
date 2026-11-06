# Farhome Switch Manager

A Home Assistant development fork focused on configuring wireless buttons and rotary controllers by room.

Farhome builds on [macpit/Home-Assistant-Switch-Manager](https://github.com/macpit/Home-Assistant-Switch-Manager). The goal is to make existing button assignments easy to find and edit, with devices grouped by room and model.

## Project status

**Design stage — updated 2026-11-06.** Farhome changes currently cover documentation only. The planned interface has not been implemented, and there is no Farhome application release or validated installation procedure yet.

The inherited application code and device blueprints remain unchanged from the [initial upstream revision](https://github.com/macpit/Home-Assistant-Switch-Manager/tree/73c7af5e2e23132f6c2e0489d99016babf8741d3). Existing upstream functionality belongs to that project; it is not a Farhome contribution.

## Planned experience

- A page for each room, with buttons and rotary controllers grouped and ordered by model.
- A device view showing current assignments and controls for supported gestures: single click, double click, hold and rotation.
- Editable actions and targets for lights, fans, plugs and other supported entities, with parameters suited to each target's capabilities.
- Support for the existing HOBEIAN pattern: click to select a light from a configured list, then rotate to adjust its brightness, with independent double-click and hold actions.
- Clear separation between the currently selected target and the configured selection list.

Cycling through a mixed list of different target types, such as lights and fans together, is outside the current scope. The detailed requirements are in the [Farhome scope document](docs/farhome/README.md).

## Development and documentation

- **`farhome`** is the default branch for Farhome documentation and future changes.
- **`master`** preserves the upstream reference for synchronization and comparison.
- [Attribution, licensing and collaboration rules](ATTRIBUTION.md)
- [Original upstream documentation at the fork's starting revision](https://github.com/macpit/Home-Assistant-Switch-Manager/blob/73c7af5e2e23132f6c2e0489d99016babf8741d3/README.md)
- [Current upstream project](https://github.com/macpit/Home-Assistant-Switch-Manager)

The integration currently retains the upstream `switch_manager` domain. Installation and migration must be planned before replacing an existing installation. No Home Assistant instance has been changed as part of the fork setup.

## Origin and acknowledgments

Farhome is an independent fork maintained by [Sazed70](https://github.com/Sazed70).

- **Original project:** [Sian-Lee-SA/Home-Assistant-Switch-Manager](https://github.com/Sian-Lee-SA/Home-Assistant-Switch-Manager).
- **Maintained upstream:** [macpit/Home-Assistant-Switch-Manager](https://github.com/macpit/Home-Assistant-Switch-Manager). Its documentation records the handover from the original author to macpit.
- **Contributors:** credit remains with all authors of the inherited code, frontend, device blueprints and other contributions. Their Git history and existing notices are retained.

Original copyright: **Copyright (C) 2022 Sian Croser**.

The Farhome name identifies this fork's work and does not imply endorsement by the upstream maintainers, Home Assistant or device vendors. Direct Farhome-specific questions to this repository; follow the [collaboration rules](ATTRIBUTION.md) when proposing changes upstream.

## License

This fork retains the original [GNU General Public License v3.0](LICENSE), including the original copyright and warranty notices. The software is provided without warranty under the terms of that license.

The README was adapted for Farhome on 2026-11-06. Original documentation remains available at the pinned upstream link above and in the `master` branch.
