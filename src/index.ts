import parseEpub from './epub';
import parseHTML from './html';
import parseTxt from './txt';

export default async function (content: string | Buffer) {
	if (typeof content === 'string') {
		if (content.startsWith('<!DOCTYPE html>') || content.startsWith('<html>')) {
			return await parseHTML(content);
		} else {
			return parseTxt(content);
		}
	} else {
		return await parseEpub(content);
	}
}

export * from './types';
