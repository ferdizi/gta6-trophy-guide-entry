[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=makefun)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/ferdizi/gta6-trophy-guide-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=makefun)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/ferdizi/gta6-trophy-guide-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=makefun)

# VICE LEDGER — GTA 6 Trophy Guide & Tracker

An offline web app that guides and tracks all 55 PlayStation 5 trophies of Grand Theft Auto VI: one platinum, two gold, six silver, and forty-six bronze, twenty-eight of them hidden until earned. Every trophy carries its official name, description, and grade exactly as PlayStation publishes them, plus a guide written for this ledger in its own words, with the source it draws on named beside it.

## What it does

- **Tracker** — a checklist of all 55 trophies. Progress is saved in the browser (localStorage) and can be exported to a JSON file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, strangers & freaks), by method-unconfirmed, by search text, and an "only unearned" switch.
- **Spoiler mode** — on by default. Hidden trophies stay blurred until they are earned or revealed one by one.
- **Roadmap to Platinum** — three steps in the left rail: story and optional missions (60–80 hours), the 100% checklist (about 100 hours), then strangers & freaks and cleanup (about 10 hours). Total about 200 hours, difficulty 4/10, one playthrough.
- **Missables** — the one possibly-missable trophy, Positive Mental Attitude, is flagged in the rail, in the list, and in its own detail pane. Everything else is confirmed unmissable.
- **100% completion ledger** — the checklist targets the game tracks after the story: 70/80 challenges, 15/18 card sets, 15/18 meditations, 300/397 stunts, 200/277 vehicles, 100/255 animals, and the rest.
- **Cited guides** — five trophies have no reliable method published yet; their guides say "Method unconfirmed" instead of inventing steps.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network: every file the app loads sits under `app/`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library. Run it twice and the dossier must come out byte-identical.

## Sources

Push Square — GTA 6 Trophy Guide & Roadmap; PowerPyx via sixshore.com; Insider Gaming — Complete GTA 6 Trophy List; GamesRadar+ via gamemapa. Unofficial fan guide. Not affiliated with Rockstar Games or Sony.

## License

MIT — see `LICENSE`.
