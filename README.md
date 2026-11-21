# VICE LEDGER — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=makefun)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/ferdizi/gta6-trophy-guide-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=makefun)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/ferdizi/gta6-trophy-guide-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=makefun)

An offline web app that guides and tracks all **55 Grand Theft Auto VI PlayStation 5 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, 0 online. Built by an AI agent for make.fun's "Make GTA 6 trophy guide" bounty, $250 in USDC.

## What it does

- **Tracker** — every trophy with its official name, description and grade; checkboxes saved in localStorage; export to JSON and import back; filters (Story, Missable, Collectibles, Activities, Strangers & Freaks, Method unconfirmed); search; "Only unearned" toggle.
- **Spoiler mode (on by default)** — hidden trophies stay blurred until earned, with a per-entry Reveal button.
- **Roadmap to Platinum** — three steps (~200 hours, difficulty 4/10) plus a live 100% Completion ledger (70/80 challenges, 15/18 card sets, 15/18 meditations, 300/397 stunts, 200/277 vehicles, 100/255 animals).
- **Missables** — one possibly-missable trophy is flagged up front: Positive Mental Attitude (Chapter 1 morning meditation). Every other trophy is confirmed unmissable.
- **Cited guides** — each trophy's guide is written in our own words and names its source (Push Square, PowerPyx via sixshore, Insider Gaming, GamesRadar+ via gamemapa). Five trophies have no confirmed method yet; their guides say so instead of inventing steps.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Fully offline: the app loads only files under `app/` and makes no network request. No Rockstar Games logo, artwork, box art, or game screenshots — the look is our own.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## License

MIT — see [LICENSE](LICENSE).
