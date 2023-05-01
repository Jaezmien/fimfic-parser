import AdmZip from 'adm-zip';
import { XMLParser } from 'fast-xml-parser';
import { HTMLElement, NodeType, parse as parse_html } from 'node-html-parser';
import { parse_node_tree } from './html';
import { FIMChapter, FIMChapterContents, FIMStory } from './types';

export default async function (content: Buffer): Promise<FIMStory> {
	const zip = new AdmZip(content);

	const opf_entry = zip.getEntry('book.opf');
	if (!opf_entry) throw new Error('Cannot find book.opf - is this a FiMFiction .epub?');

	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: '@_',
	});
	const opf = parser.parse(opf_entry.getData().toString('utf-8'));

	const story: FIMStory = {
		Format: 'HTML',
		Title: opf.package.metadata['dc:title'],
		Author: opf.package.metadata['dc:creator']['#text'],
		Content: [],
	};

	let chapters_lookup = opf.package.spine.itemref
		.filter(
			(obj: any) =>
				![
					'coverPage',
					'chapter1', // Title
					'chapter2', // Table of Contents
				].includes(obj['@_idref'])
		)
		.map((obj: any) => obj['@_idref']);

	for (const lookup of chapters_lookup) {
		const chapter_item_node = opf.package.manifest.item.find((node: any) => node['@_id'] === lookup);

		const chapter_entry = zip.getEntry(chapter_item_node['@_href']);
		if (!chapter_entry) throw Error('fimfic-parser error - chapter missing');

		const chapter_content = chapter_entry.getData().toString('utf-8');

		const dom = parse_html(chapter_content);
		const chapterContents: FIMChapterContents = [];
		const chapterNode = dom.getElementsByTagName('body')[0];

		const chapterContentNodes = Array.from(chapterNode.childNodes);

		// Remove empty elements
		while (!chapterContentNodes[0].rawText.trim() && chapterContentNodes[0].nodeType === NodeType.TEXT_NODE)
			chapterContentNodes.shift();

		// First element is the chapter title in h1 tag
		const chapterTitleElement = chapterContentNodes.shift();

		const chapter: FIMChapter = {
			Title: chapterTitleElement!.rawText,
			Contents: chapterContents,
		};

		for (const contentNode of chapterContentNodes) {
			const content = await parse_node_tree(contentNode as HTMLElement);
			chapterContents.push(content);
		}

		// Remove empty elements (again)
		if (typeof chapterContents[0] === 'string' && !chapterContents[0].trim()) chapterContents.shift();
		for (let i = chapterContents.length - 1; i >= 0; i--) {
			const content = chapterContents[i];
			if (typeof content !== 'string' || (typeof content === 'string' && content.trim())) break;
			chapterContents.pop();
		}

		story.Content.push(chapter);
	}

	return story;
}
