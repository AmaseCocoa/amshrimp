<mk-drive-file-viewer>
	<div class="preview">
		<img if={ kind == 'image' } src={ file.url } alt={ file.name } title={ file.name }>
		<i if={ kind != 'image' } class="fa fa-file"></i>
		<footer if={ kind == 'image' }>
			<span class="size">
				<span class="width">{ file.properties.width }</span>
				<span class="time">×</span>
				<span class="height">{ file.properties.height }</span>
				<span class="px">px</span>
			</span>
			<span class="separator"></span>
			<span class="aspect-ratio">
				<span class="width">{ file.properties.width / getGcd(file.properties.width, file.properties.height) }</span>
				<span class="colon">:</span>
				<span class="height">{ file.properties.height / getGcd(file.properties.width, file.properties.height) }</span>
			</span>
		</footer>
	</div>
	<div class="info">
		<div>
			<span class="type"><mk-file-type-icon type={ file.type }></mk-file-type-icon>{ file.type }</span>
			<span class="separator"></span>
			<span class="data-size">{ bytesToSize(file.datasize) }</span>
			<span class="separator"></span>
			<span class="created-at"><mk-time time={ file.created_at }></mk-time></span>
		</div>
	</div>
	<div class="menu">
		<div>
			<a href={ file.url + '?download' } download={ file.name }>
				<i class="fa fa-download"></i>ダウンロード
			</a>
			<button onclick={ rename }>
				<i class="fa fa-pencil"></i>名前を変更
			</button>
		</div>
	</div>
	<div class="hash">
		<div>
			<p>
				<i class="fa fa-hashtag"></i>ファイルのハッシュ値
			</p>
			<code>{ file.hash }</code>
		</div>
	</div>
	<style type="stylus">
		:scope
			display block

			> .preview
				padding 8px
				background #f0f0f0

				> img
					display block
					max-width 100%
					max-height 300px
					margin 0 auto
					box-shadow 1px 1px 4px rgba(0, 0, 0, 0.2)

				> footer
					padding 8px 8px 0 8px
					font-size 0.8em
					color #888
					text-align center

					> .separator
						display inline
						padding 0 4px

					> .size
						display inline

						.time
							margin 0 2px

						.px
							margin-left 4px

					> .aspect-ratio
						display inline
						opacity 0.7

						&:before
							content "("

						&:after
							content ")"

			> .info
				padding 14px
				font-size 0.8em
				border-top solid 1px #dfdfdf

				> div
					max-width 500px
					margin 0 auto

					> .separator
						padding 0 4px
						color #cdcdcd

					> .type
					> .data-size
						color #9d9d9d

						> mk-file-type-icon
							margin-right 4px

					> .created-at
						color #bdbdbd

						> i
							margin-right 2px

			> .menu
				padding 14px
				border-top solid 1px #dfdfdf

				> div
					max-width 500px
					margin 0 auto

					> *
						display block
						width 100%
						padding 10px 16px
						margin 0 0 12px 0
						color #333
						font-size 0.9em
						text-align center
						text-decoration none
						text-shadow 0 1px 0 rgba(255, 255, 255, 0.9)
						background-image linear-gradient(#fafafa, #eaeaea)
						border 1px solid #ddd
						border-bottom-color #cecece
						border-radius 3px

						&:last-child
							margin-bottom 0

						&:active
							background-color #767676
							background-image none
							border-color #444
							box-shadow 0 1px 3px rgba(0, 0, 0, 0.075), inset 0 0 5px rgba(0, 0, 0, 0.2)

						> i
							margin-right 4px

			> .hash
				padding 14px
				border-top solid 1px #dfdfdf

				> div
					max-width 500px
					margin 0 auto

					> p
						display block
						margin 0
						padding 0
						color #555
						font-size 0.9em

						> i
							margin-right 4px

					> code
						display block
						width 100%
						margin 6px 0 0 0
						padding 8px
						overflow auto
						font-size 0.8em
						border solid 1px #dfdfdf
						border-radius 2px
						background #f5f5f5

	</style>
	<script>
		@bytes-to-size = require '../../../common/scripts/bytes-to-size.js'
		@get-gcd = require '../../../common/scripts/gcd.js'

		@file = @opts.file
		@kind = @file.type.split \/ .0
	</script>
</mk-drive-file-viewer>
