import * as EventEmitter from 'events';
import * as express from 'express';
const crypto = require('crypto');
import User from '../models/user';
import config from '../../conf';

module.exports = async (app: express.Application) => {
	if (config.github_bot == null) return;

	const bot = await User.findOne({
		username_lower: config.github_bot.username.toLowerCase()
	});

	if (bot == null) {
		console.warn(`GitHub hook bot specified, but not found: @${config.github_bot.username}`);
		return;
	}

	const post = text => require('../endpoints/posts/create')({ text }, bot);

	const handler = new EventEmitter();

	app.post('/hooks/github', (req, res, next) => {
		if ((new Buffer(req.headers['x-hub-signature'])).equals(new Buffer('sha1=' + crypto.createHmac('sha1', config.github_bot.hook_secret).update(JSON.stringify(req.body)).digest('hex')))) {
			handler.emit(req.headers['x-github-event'], req.body);
			res.sendStatus(200);
		} else {
			res.sendStatus(400);
		}
	});

	handler.on('status', event => {
		const state = event.state;
		switch (state) {
			case 'failure':
				const commit = event.commit.commit;
				post(`⚠️🚨BUILD FAILED🚨⚠️: ?[${commit.message}](${commit.url})`);
				break;
		}
	});

	handler.on('push', event => {
		const ref = event.ref;
		switch (ref) {
			case 'refs/heads/master':
				const pusher = event.pusher;
				const compare = event.compare;
				const commits = event.commits;
				post([
					`Pushed by **${pusher.name}** with ?[${commits.length} commit${commits.length > 1 ? 's' : ''}](${compare}):`,
					commits.map(commit => `・?[${commit.message.split('\n')[0]}](${commit.url})`).join('\n'),
				].join('\n'));
				break;
			case 'refs/heads/release':
				const commit = event.commits[0];
				post(`RELEASED: ${commit.message}`);
				break;
		}
	});

	handler.on('issues', event => {
		const issue = event.issue;
		const action = event.action;
		let title: string;
		switch (action) {
			case 'opened': title = 'New Issue'; break;
			case 'closed': title = 'Issue Closed'; break;
			case 'reopened': title = 'Issue Reopened'; break;
			default: return;
		}
		post(`${title}: <${issue.number}>「${issue.title}」\n${issue.html_url}`);
	});

	handler.on('issue_comment', event => {
		const issue = event.issue;
		const comment = event.comment;
		const action = event.action;
		let text: string;
		switch (action) {
			case 'created': text = `Commented to「${issue.title}」:${comment.user.login}「${comment.body}」\n${comment.html_url}`; break;
			default: return;
		}
		post(text);
	});

	handler.on('watch', event => {
		const sender = event.sender;
		post(`⭐️Starred by **${sender.login}**`);
	});

	handler.on('fork', event => {
		const repo = event.forkee;
		post(`🍴Forked:\n${repo.html_url}`);
	});

	handler.on('pull_request', event => {
		const pr = event.pull_request;
		const action = event.action;
		let text: string;
		switch (action) {
			case 'opened': text = `New Pull Request:「${pr.title}」\n${pr.html_url}`; break;
			case 'reopened': text = `Pull Request Reopened:「${pr.title}」\n${pr.html_url}`; break;
			case 'closed':
				text = pr.merged
					? `Pull Request Merged!:「${pr.title}」\n${pr.html_url}`
					: `Pull Request Closed:「${pr.title}」\n${pr.html_url}`;
				break;
			default: return;
		}
		post(text);
	});
};
