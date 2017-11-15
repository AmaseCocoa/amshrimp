/**
 * App initializer
 */

declare var VERSION: string;
declare var LANG: string;

import * as riot from 'riot';
import checkForUpdate from './common/scripts/check-for-update';
import mixin from './common/mixins';
import CONFIG from './common/scripts/config';
import MiOS from './common/mios';
require('./common/tags');

/**
 * APP ENTRY POINT!
 */

console.info(`Misskey v${VERSION} (葵 aoi)`);

{ // Set lang attr
	const html = document.documentElement;
	html.setAttribute('lang', LANG);
}

{ // Set description meta tag
	const head = document.getElementsByTagName('head')[0];
	const meta = document.createElement('meta');
	meta.setAttribute('name', 'description');
	meta.setAttribute('content', '%i18n:common.misskey%');
	head.appendChild(meta);
}

document.domain = CONFIG.host;

// Set global configuration
(riot as any).mixin({ CONFIG });

// iOSでプライベートモードだとlocalStorageが使えないので既存のメソッドを上書きする
try {
	localStorage.setItem('kyoppie', 'yuppie');
} catch (e) {
	Storage.prototype.setItem = () => { }; // noop
}

// クライアントを更新すべきならする
if (localStorage.getItem('should-refresh') == 'true') {
	localStorage.removeItem('should-refresh');
	location.reload(true);
}

// MiOSを初期化してコールバックする
export default callback => {
	const mios = new MiOS();

	mios.init(() => {
		// ミックスイン初期化
		mixin(mios);

		// ローディング画面クリア
		const ini = document.getElementById('ini');
		ini.parentNode.removeChild(ini);

		// アプリ基底要素マウント
		const app = document.createElement('div');
		app.setAttribute('id', 'app');
		document.body.appendChild(app);

		try {
			callback(mios);
		} catch (e) {
			panic(e);
		}

		// 更新チェック
		setTimeout(() => {
			checkForUpdate(mios);
		}, 3000);
	});
};

// BSoD
function panic(e) {
	console.error(e);

	// Display blue screen
	document.documentElement.style.background = '#1269e2';
	document.body.innerHTML =
		'<div id="error">'
			+ '<h1>:( 致命的な問題が発生しました。</h1>'
			+ '<p>お使いのブラウザ(またはOS)のバージョンを更新すると解決する可能性があります。</p>'
			+ '<hr>'
			+ `<p>エラーコード: ${e.toString()}</p>`
			+ `<p>ブラウザ バージョン: ${navigator.userAgent}</p>`
			+ `<p>クライアント バージョン: ${VERSION}</p>`
			+ '<hr>'
			+ '<p>問題が解決しない場合は、上記の情報をお書き添えの上 syuilotan@yahoo.co.jp までご連絡ください。</p>'
			+ '<p>Thank you for using Misskey.</p>'
		+ '</div>';

	// TODO: Report the bug
}
