# Router
#================================

riot = require \riot
route = require \page
page = null

module.exports = (me) ~>

	# Routing
	#--------------------------------

	route \/ index
	route \/i/notifications notifications
	route \/i/messaging messaging
	route \/i/messaging/:username messaging
	route \/i/drive drive
	route \/i/drive/folder/:folder drive
	route \/i/drive/file/:file drive
	route \/i/settings settings
	route \/i/settings/signin-history settings-signin
	route \/i/settings/api settings-api
	route \/i/settings/twitter settings-twitter
	route \/i/settings/authorized-apps settings-authorized-apps
	route \/post/new new-post
	route \/post::post post
	route \/search::query search
	route \/:user user.bind null \posts
	route \/:user/graphs user.bind null \graphs
	route \/:user/followers user-followers
	route \/:user/following user-following
	route \/:user/:post post
	route \* not-found

	# Handlers
	#--------------------------------

	# /
	function index
		if me? then home! else entrance!

	# ホーム
	function home
		mount document.create-element \mk-home-page

	# 玄関
	function entrance
		mount document.create-element \mk-entrance

	# 通知
	function notifications
		mount document.create-element \mk-notifications-page

	# メッセージ
	function messaging ctx
		if ctx.params.username
			p = document.create-element \mk-messaging-room-page
			p.set-attribute \username ctx.params.username
			mount p
		else
			mount document.create-element \mk-messaging-page

	# 新規投稿
	function new-post
		mount document.create-element \mk-new-post-page

	# 設定
	function settings
		mount document.create-element \mk-settings-page
	function settings-signin
		mount document.create-element \mk-signin-history-page
	function settings-api
		mount document.create-element \mk-api-info-page
	function settings-twitter
		mount document.create-element \mk-twitter-setting-page
	function settings-authorized-apps
		mount document.create-element \mk-authorized-apps-page

	# 検索
	function search ctx
		document.create-element \mk-search-page
			..set-attribute \query ctx.params.query
			.. |> mount

	# ユーザー
	function user page, ctx
		document.create-element \mk-user-page
			..set-attribute \user ctx.params.user
			..set-attribute \page page
			.. |> mount

	# フォロー一覧
	function user-following ctx
		document.create-element \mk-user-following-page
			..set-attribute \user ctx.params.user
			.. |> mount

	# フォロワー一覧
	function user-followers ctx
		document.create-element \mk-user-followers-page
			..set-attribute \user ctx.params.user
			.. |> mount

	# 投稿詳細ページ
	function post ctx
		document.create-element \mk-post-page
			..set-attribute \post ctx.params.post
			.. |> mount

	# ドライブ
	function drive ctx
		p = document.create-element \mk-drive-page
		if ctx.params.folder then p.set-attribute \folder ctx.params.folder
		if ctx.params.file then p.set-attribute \file ctx.params.file
		mount p

	# not found
	function not-found
		mount document.create-element \mk-not-found

	# Register mixin
	#--------------------------------

	riot.mixin \page do
		page: route

	# Exec
	#--------------------------------

	route!

# Mount
#================================

function mount content
	if page? then page.unmount!
	body = document.get-element-by-id \app
	page := riot.mount body.append-child content .0
