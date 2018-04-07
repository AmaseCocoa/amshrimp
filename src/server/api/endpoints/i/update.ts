/**
 * Module dependencies
 */
import $ from 'cafy';
import User, { isValidName, isValidDescription, isValidLocation, isValidBirthday, pack } from '../../../../models/user';
import event from '../../../../publishers/stream';
import config from '../../../../config';

/**
 * Update myself
 *
 * @param {any} params
 * @param {any} user
 * @param {any} _
 * @param {boolean} isSecure
 * @return {Promise<any>}
 */
module.exports = async (params, user, _, isSecure) => new Promise(async (res, rej) => {
	// Get 'name' parameter
	const [name, nameErr] = $(params.name).optional.string().pipe(isValidName).$;
	if (nameErr) return rej('invalid name param');
	if (name) user.name = name;

	// Get 'description' parameter
	const [description, descriptionErr] = $(params.description).optional.nullable.string().pipe(isValidDescription).$;
	if (descriptionErr) return rej('invalid description param');
	if (description !== undefined) user.description = description;

	// Get 'location' parameter
	const [location, locationErr] = $(params.location).optional.nullable.string().pipe(isValidLocation).$;
	if (locationErr) return rej('invalid location param');
	if (location !== undefined) user.profile.location = location;

	// Get 'birthday' parameter
	const [birthday, birthdayErr] = $(params.birthday).optional.nullable.string().pipe(isValidBirthday).$;
	if (birthdayErr) return rej('invalid birthday param');
	if (birthday !== undefined) user.profile.birthday = birthday;

	// Get 'avatarId' parameter
	const [avatarId, avatarIdErr] = $(params.avatarId).optional.id().$;
	if (avatarIdErr) return rej('invalid avatarId param');
	if (avatarId) user.avatarId = avatarId;

	// Get 'bannerId' parameter
	const [bannerId, bannerIdErr] = $(params.bannerId).optional.id().$;
	if (bannerIdErr) return rej('invalid bannerId param');
	if (bannerId) user.bannerId = bannerId;

	// Get 'isBot' parameter
	const [isBot, isBotErr] = $(params.isBot).optional.boolean().$;
	if (isBotErr) return rej('invalid isBot param');
	if (isBot != null) user.isBot = isBot;

	// Get 'autoWatch' parameter
	const [autoWatch, autoWatchErr] = $(params.autoWatch).optional.boolean().$;
	if (autoWatchErr) return rej('invalid autoWatch param');
	if (autoWatch != null) user.settings.autoWatch = autoWatch;

	await User.update(user._id, {
		$set: {
			name: user.name,
			description: user.description,
			avatarId: user.avatarId,
			bannerId: user.bannerId,
			'profile': user.profile,
			'isBot': user.isBot,
			'settings': user.settings
		}
	});

	// Serialize
	const iObj = await pack(user, user, {
		detail: true,
		includeSecrets: isSecure
	});

	// Send response
	res(iObj);

	// Publish i updated event
	event(user._id, 'i_updated', iObj);

	// Update search index
	if (config.elasticsearch.enable) {
		const es = require('../../../db/elasticsearch');

		es.index({
			index: 'misskey',
			type: 'user',
			id: user._id.toString(),
			body: {
				name: user.name,
				bio: user.bio
			}
		});
	}
});
