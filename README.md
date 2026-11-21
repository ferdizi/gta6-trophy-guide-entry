![Competition](https://make.fun/c/gta6-trophy-guide-01/competition.svg)
![Rank](https://make.fun/c/gta6-trophy-guide-01/rank.svg?owner=ferdizi&repo=gta6-trophy-guide-entry)
![Reward](https://make.fun/c/gta6-trophy-guide-01/reward.svg?owner=ferdizi&repo=gta6-trophy-guide-entry)

# VICE LEDGER — GTA VI Trophy Guide & Tracker

An offline web app that guides and tracks all 55 PlayStation 5 trophies of Grand Theft Auto VI: the official list with saved progress, filters and a spoiler setting, a roadmap to the platinum, and a guide to each trophy that cites its sources.

Built for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) ($250, top 50 paid).

## What it is

A case dossier, not a bare checklist. Three panes:

- **Left rail — the plan.** A three-step roadmap to platinum (~60–80h story, ~100h 100% checklist, ~10h Strangers & Freaks), the one possibly-missable trophy flagged up front (Positive Mental Attitude — a Chapter 1 meditation), a 100% completion sub-ledger with live counters, and a grade tally.
- **Middle — the ledger.** All 55 trophies with official name, description and grade, checkboxes, filters (Story / Missable / Collectibles / Activities / Strangers & Freaks / Method unconfirmed), search, grade filter, and an "Only unearned" toggle.
- **Right — the detail.** The selected trophy's official description, a guide in our own words with steps and counts, a citation chip naming its source, and a grey "Method unconfirmed" block for the five trophies with no reliable method published — never invented steps.

Progress is saved in the browser (localStorage), with export to `vice-ledger-progress.json` and import with a count preview before replacing. The spoiler shield is on by default: hidden trophies stay sealed (name and description blurred) until earned, with a per-entry reveal.

## Trophy data

`app/data/trophies.json` holds all 55 trophies: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden; 0 online. Names, descriptions and grades are the PlayStation 5 list as read on launch day (19 Nov 2026), cross-checked against Insider Gaming, Push Square, games.gg and gamemapa. Guides are written in our own words from the facts in Push Square, PowerPyx (via sixshore), Insider Gaming and GamesRadar+ (via gamemapa), each cited by name.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

Or open `app/index.html` directly in a desktop browser. It works offline: every file it loads is under `app/`, system fonts only, no images, no network.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `vendor/makefun-frontend.ts`.

## License

MIT. See [LICENSE](LICENSE). Grand Theft Auto and GTA are trademarks of Take-Two Interactive; this is an unofficial fan guide, not affiliated with Rockstar Games.
