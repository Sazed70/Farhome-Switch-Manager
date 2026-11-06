# Attribution, licensing and collaboration

Last updated: 2026-11-06.

## Provenance and credit

Farhome Switch Manager is an independent development fork of [macpit/Home-Assistant-Switch-Manager](https://github.com/macpit/Home-Assistant-Switch-Manager). The original project is [Sian-Lee-SA/Home-Assistant-Switch-Manager](https://github.com/Sian-Lee-SA/Home-Assistant-Switch-Manager). The inherited LICENSE begins with **Copyright (C) 2022 Sian Croser**. The [upstream README at the fork's starting revision](https://github.com/macpit/Home-Assistant-Switch-Manager/blob/73c7af5e2e23132f6c2e0489d99016babf8741d3/README.md) records the handover to macpit; preserve that acknowledgment and the credit due to all contributors. The main README is adapted to describe Farhome, with visible origin and acknowledgments; the original documentation remains available at that pinned link and in the `master` branch.

The initial fork uses upstream commit `73c7af5e2e23132f6c2e0489d99016babf8741d3`. Keep its Git history, authorship and notices. Attribute only actual Farhome changes to Farhome contributors. Sazed70 maintains this fork independently; names and links do not imply upstream or vendor endorsement.

## Rules for changes and releases

- Preserve the inherited [GPLv3 LICENSE](LICENSE), copyright, attribution and warranty notices. Retain applicable third-party notices and terms; this document does not replace or amend any license.
- Identify modifications prominently and give relevant dates. Use suitable file notices and change documentation, retaining earlier authors' notices.
- Distribute covered modifications under the inherited GPL terms. When distributing built artifacts, provide their corresponding source and the required build material by a method allowed by the license; check the actual release contents before publishing.
- Preserve applicable legal notices in the interface. A Farhome identity must clearly distinguish this fork from upstream without claiming ownership of upstream work.
- Check licenses and permissions before adding dependencies, copied code, icons, product photographs or other assets. Credit alone is not permission, and the repository license does not automatically cover outside material.
- Keep `master` as the upstream reference and Farhome changes on `farhome` or topic branches. Preserve author information when importing or merging contributions.

## Collaboration and upstream contributions

Follow the [GitHub Community Guidelines](https://docs.github.com/en/site-policy/github-terms/github-community-guidelines) and [GitHub Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service). Keep discussions respectful, factual and relevant; respect copyright, privacy and maintainers' time.

Use this fork for Farhome-specific support. Before proposing an upstream fix, reproduce the issue on upstream, check for existing reports, and prepare a focused change with honest validation results. Follow upstream's README, [pull request template](https://github.com/macpit/Home-Assistant-Switch-Manager/blob/master/.github/PULL_REQUEST_TEMPLATE.md) and issue templates. The current issue templates ask users not to request device blueprints from the maintainer: contribute tested blueprints instead, following naming, action ordering and image conventions. Never mark unperformed checks as passed.

Useful, general improvements may be proposed upstream when appropriate. Contacting maintainers or opening upstream issues or pull requests requires a separate instruction from the repository owner; creating this fork is not such an instruction.

## Current status

On 2026-11-06 Farhome added the room-based Pulsanti panel, controller inventory,
separate metadata, revision-checked administrative APIs, quick gesture forms and
persistent native input_select editing on `work/farhome-panel`. Existing editor
mutations now share the revision/write coordinator. Changed inherited source files
carry dated notices; source, lockfile and generated bundle are versioned together.
The GPLv3 LICENSE, original copyright, Git history, device blueprints and upstream
event/script engine are preserved. No Farhome release or HA installation was made.

The frontend continues to bundle Lit under BSD-3-Clause and TypeScript helpers
under their permissive terms; the inherited runtime-component loader acknowledges
its MIT-licensed adaptation from KipK. Full terms accompany the integration in
[THIRD_PARTY_NOTICES.txt](custom_components/switch_manager/assets/THIRD_PARTY_NOTICES.txt).
The minifier preserves legal comments. Build-only dependencies remain subject to
their package licenses; they are not included in the runtime bundle.

Device images are remote references to the exact Zigbee2MQTT model catalogue or
to already installed blueprint assets. Each displayed image has a source link.
No new product photograph is copied into this fork. Custom HTTPS images may be
referenced; local Zigbee2MQTT `device_icons` paths currently fall back to an icon.
Image availability or attribution does not establish a right to redistribute it.
No exhaustive historical asset-rights audit is claimed.
