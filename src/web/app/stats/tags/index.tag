<mk-index>
	<h1>Misskey<i>Statistics</i></h1>
	<main if={ !initializing }>
		<mk-users stats={ stats }/>
		<mk-posts stats={ stats }/>
	</main>
	<footer><a href={ CONFIG.url }>{ CONFIG.host }</a></footer>
	<style>
		:scope
			display block
			margin 0 auto
			padding 0 16px
			max-width 700px

			> h1
				margin 0
				padding 24px 0 0 0
				font-size 24px
				font-weight normal

				> i
					font-style normal
					color #f43b16

			> main
				> *
					margin 24px 0
					padding-top 24px
					border-top solid 1px #eee

					> h2
						margin 0 0 12px 0
						font-size 18px
						font-weight normal

			> footer
				margin 24px 0
				text-align center

				> a
					color #546567
	</style>
	<script>
		this.mixin('api');

		this.initializing = true;

		this.on('mount', () => {
			this.api('stats').then(stats => {
				this.update({
					initializing: false,
					stats
				});
			});
		});
	</script>
</mk-index>

<mk-posts>
	<h2>%i18n:stats.posts-count% <b>{ stats.posts_count }</b></h2>
	<mk-posts-chart if={ !initializing } data={ data }/>
	<style>
		:scope
			display block
	</style>
	<script>
		this.mixin('api');

		this.initializing = true;
		this.stats = this.opts.stats;

		this.on('mount', () => {
			this.api('aggregation/posts', {
				limit: 365
			}).then(data => {
				this.update({
					initializing: false,
					data
				});
			});
		});
	</script>
</mk-posts>

<mk-users>
	<h2>%i18n:stats.users-count% <b>{ stats.users_count }</b></h2>
	<mk-users-chart if={ !initializing } data={ data }/>
	<style>
		:scope
			display block
	</style>
	<script>
		this.mixin('api');

		this.initializing = true;
		this.stats = this.opts.stats;

		this.on('mount', () => {
			this.api('aggregation/users', {
				limit: 365
			}).then(data => {
				this.update({
					initializing: false,
					data
				});
			});
		});
	</script>
</mk-users>

<mk-posts-chart>
	<svg riot-viewBox="0 0 { viewBoxX } { viewBoxY }" preserveAspectRatio="none">
		<title>Black ... Total<br/>Blue ... Posts<br/>Red ... Replies<br/>Green ... Reposts</title>
		<polyline
			riot-points={ pointsPost }
			fill="none"
			stroke-width="1"
			stroke="#41ddde"/>
		<polyline
			riot-points={ pointsReply }
			fill="none"
			stroke-width="1"
			stroke="#f7796c"/>
		<polyline
			riot-points={ pointsRepost }
			fill="none"
			stroke-width="1"
			stroke="#a1de41"/>
		<polyline
			riot-points={ pointsTotal }
			fill="none"
			stroke-width="1"
			stroke="#555"
			stroke-dasharray="2 2"/>
	</svg>
	<style>
		:scope
			display block

			> svg
				display block
				padding 1px
				width 100%
	</style>
	<script>
		this.viewBoxX = 365;
		this.viewBoxY = 80;

		this.data = this.opts.data.reverse();
		this.data.forEach(d => d.total = d.posts + d.replies + d.reposts);
		const peak = Math.max.apply(null, this.data.map(d => d.total));

		this.on('mount', () => {
			this.render();
		});

		this.render = () => {
			this.update({
				pointsPost: this.data.map((d, i) => `${i},${(1 - (d.posts / peak)) * this.viewBoxY}`).join(' '),
				pointsReply: this.data.map((d, i) => `${i},${(1 - (d.replies / peak)) * this.viewBoxY}`).join(' '),
				pointsRepost: this.data.map((d, i) => `${i},${(1 - (d.reposts / peak)) * this.viewBoxY}`).join(' '),
				pointsTotal: this.data.map((d, i) => `${i},${(1 - (d.total / peak)) * this.viewBoxY}`).join(' ')
			});
		};
	</script>
</mk-posts-chart>

<mk-users-chart>
	<svg riot-viewBox="0 0 { viewBoxX } { viewBoxY }" preserveAspectRatio="none">
		<polyline
			riot-points={ points }
			fill="none"
			stroke-width="1"
			stroke="#555"/>
	</svg>
	<style>
		:scope
			display block

			> svg
				display block
				padding 1px
				width 100%
	</style>
	<script>
		this.viewBoxX = 365;
		this.viewBoxY = 80;

		this.data = this.opts.data.reverse();
		const peak = Math.max.apply(null, this.data.map(d => d.count));

		this.on('mount', () => {
			this.render();
		});

		this.render = () => {
			this.update({
				points: this.data.map((d, i) => `${i},${(1 - (d.count / peak)) * this.viewBoxY}`).join(' ')
			});
		};
	</script>
</mk-users-chart>
