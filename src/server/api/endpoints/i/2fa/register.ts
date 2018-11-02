import $ from 'cafy';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import User, { ILocalUser } from '../../../../../models/user';
import config from '../../../../../config';
import getParams from '../../../get-params';

export const meta = {
	requireCredential: true,

	secure: true,

	params: {
		password: {
			validator: $.str
		}
	}
};

export default async (params: any, user: ILocalUser) => new Promise(async (res, rej) => {
	const [ps, psErr] = getParams(meta, params);
	if (psErr) return rej(psErr);

	// Compare password
	const same = await bcrypt.compare(ps.password, user.password);

	if (!same) {
		return rej('incorrect password');
	}

	// Generate user's secret key
	const secret = speakeasy.generateSecret({
		length: 32
	});

	await User.update(user._id, {
		$set: {
			twoFactorTempSecret: secret.base32
		}
	});

	// Get the data URL of the authenticator URL
	QRCode.toDataURL(speakeasy.otpauthURL({
		secret: secret.base32,
		encoding: 'base32',
		label: user.username,
		issuer: config.host
	}), (err, data_url) => {
		res({
			qr: data_url,
			secret: secret.base32,
			label: user.username,
			issuer: config.host
		});
	});
});
