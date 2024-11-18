**AmShrimp** is fork of IceshrimpJS and focused on UI/performance improvements and maintaining a lightweight fork.

## 注意
`personal`ブランチは`dev`をベースに個人用インスタンスで利用するためのいくつかの改造が施されています。利用はおすすめしません。

## Purpose
- Create and maintain lightweight v12 forks compatible with Misskey and other major forks

Original Text:

---

> **Note**
> This project is **not** inactive.
> 
> Almost all of our current development efforts are going into the Iceshrimp.NET [rewrite](/iceshrimp/Iceshrimp.NET), to further our goal of increasing stability and performance.<br/>
> This means that Iceshrimp-JS (this project) is only receiving security patches and minor bug fixes. Support is of course still available on the usual channels.
> 
> There is already an easy upgrade path available for existing Iceshrimp instances, though we don't recommend taking it just yet.<br/>
> With Iceshrimp.NET getting ever-closer to a stable release, we hope you're just as excited as we are. Check out the [repository](/iceshrimp/Iceshrimp.NET) for more information.

---
- Highlighted changes:
	- First-class Mastodon client API support
	- Significantly improved database performance
	- Options to prune cached remote media automatically
	- Proper support for split domain deployments, both local and remote
	- So much more - Read the [changelog](CHANGELOG.md) to get an overview of all changes
- Don't like the Web UI? We test our Mastodon-compatible API against the following clients:
  - [Elk](https://elk.zone), [Phanpy](https://phanpy.social/), [Enafore](https://enafore.social/), [Masto-FE-standalone](https://iceshrimp.dev/iceshrimp/masto-fe-standalone) (Web)
  - [Mona](https://apps.apple.com/us/app/mona-for-mastodon/id1659154653), [Toot!](https://apps.apple.com/us/app/toot-for-mastodon/id1229021451), [Ice Cubes](https://apps.apple.com/us/app/ice-cubes-for-mastodon/id6444915884), [Tusker](https://apps.apple.com/us/app/tusker/id1498334597), [Feditext](https://github.com/feditext/feditext), [Mastodon](https://apps.apple.com/us/app/mastodon-for-iphone-and-ipad/id1571998974) (iOS)
  - [Tusky](https://tusky.app/), [Moshidon](https://lucasggamerm.github.io/moshidon/), [Megalodon](https://sk22.github.io/megalodon/), [Mastodon](https://play.google.com/store/apps/details?id=org.joinmastodon.android) (Android)
- Project goals:
  - No-nonsense bug fixes
  - QoL improvements
  - Better performance
  - Change of focus to actual community needs
  - Prioritization of user choice and configurability
- Project anti-goals:
  - Flashy marketing
  - Commercialization of any kind
- Documentation on installing (and updating) Iceshrimp using:
  - [Binary packages](https://iceshrimp.dev/iceshrimp/packaging)
  - [Docker Compose](docs/docker-compose-install.md)
  - [Manual installation](docs/install.md)
- Documentation on migrating from Firefish can be found [here](docs/migrate.md).
- Want to sign up at an existing instance?
	- Check out [FediDB](https://fedidb.org/software/iceshrimp) or [Fediverse Observer](https://iceshrimp.fediverse.observer/list) to get an overview of the instances that are out there.
	- Please note that we do not operate a "flagship instance", the only project-affiliated domain is `iceshrimp.dev`.
- Want to donate to the project?
  - Our frontend dev (Lilian) needs help paying for healthcare costs. You can contribute [here](https://bunq.me/LilianHealthcare). Money from the fund will be used for co-pays, and medical expenses not covered by insurance.
- Need help or want to contribute? Join the [chat room](https://chat.iceshrimp.dev)!

---
