import parseHTML from './html';
import parseTxt from './txt';

export default async function (content: string) {
	if (content.startsWith('<!DOCTYPE html>') || content.startsWith('<html>')) {
		return await parseHTML(content);
	} else {
		return parseTxt(content);
	}
}
