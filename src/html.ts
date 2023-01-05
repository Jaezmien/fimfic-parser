import parse_html from 'node-html-parser';
import { FIMChapter, FIMChapterContent, FIMChapterContents, FIMChapterNode, FIMStory } from './types';

function fetch_image_as_base64(url: string) {
	return new Promise<string>((res, rej) => {
		// Adjust camo.fimfiction.net links
		let u = new URL(url);
		if (u.host === 'camo.fimfiction.net') url = u.searchParams.get('url') || url;

		fetch(url)
			.then((r) => {
				r.arrayBuffer()
					.then((b) => {
						res(
							`data:${r.headers.get('content-type')};charset=utf-8;base64,${Buffer.from(b).toString(
								'base64'
							)}`
						);
					})
					.catch(rej);
			})
			.catch(rej);
	});
}

async function parse_node_tree(el: HTMLElement): Promise<FIMChapterContent> {
	// Text Element
	if (el.nodeType === 3) {
		return el.textContent!;
	}

	// Node Element
	const tree: FIMChapterNode = { tag: el.tagName.toLowerCase() };

	// Clone attributes
	// el.attributes.length doesn't actually grab the length of the NamedNodeMap.
	if (Object.keys(el.attributes).length) {
		tree.attributes = {};

		for (const [key, attribute] of Object.entries(el.attributes)) {
			// attribute.value and attribute.nodeValue is undefined
			tree.attributes[key] = attribute.toString();
		}

		// If the node is an image - try to cache the image as base64 data.
		if (tree.tag === 'img' && tree.attributes.src) {
			tree.attributes.src = await fetch_image_as_base64(tree.attributes.src);
		}
	}

	if (el.childNodes.length) {
		if (el.childNodes.length === 1 && el.firstChild?.nodeType === 3) {
			// Specific check to return a string instead of a whole tree
			if (tree.tag === 'p') return (await parse_node_tree(el.firstChild as HTMLElement)) as string;
			else tree.data = (await parse_node_tree(el.firstChild as HTMLElement)) as string;
		} else {
			tree.children = [];
			for (const child of el.childNodes) {
				tree.children.push(await parse_node_tree(child as HTMLElement));
			}
		}
	}

	return tree;
}

export default async function (content: string): Promise<FIMStory> {
	const story: FIMStory = {
		Format: 'HTML',
		Author: '',
		Title: '',
		Content: [],
	};

	const dom = parse_html(content);

	story.Title = dom.querySelector('header h1 a')!.textContent;
	story.Author = dom.querySelector('header h2 a')!.textContent;

	for (const chapterNode of dom.querySelectorAll('article.chapter') as unknown as Array<HTMLElement>) {
		// Grabs chapter name from a header.

		// <header>
		// 		<h1><a name='{INDEX}'></a>{CHAPTER_NAME}</h1>
		const chapterName = Array.from(chapterNode.querySelector<HTMLHeadingElement>('header h1')!.childNodes)
			.find((n) => n.nodeType === 3)!
			.toString();

		// Removes <header>, <footer>, and empty nodes
		const chapterContentNodes = Array.from(chapterNode.childNodes);
		while (chapterContentNodes[0].toString().startsWith('<header>') || !chapterContentNodes[0].toString().trim())
			chapterContentNodes.shift();
		while (
			chapterContentNodes[chapterContentNodes.length - 1].toString().startsWith('<footer>') ||
			!chapterContentNodes[chapterContentNodes.length - 1].toString().trim()
		)
			chapterContentNodes.pop();

		const chapterContents: FIMChapterContents = [];
		for (const contentNode of chapterContentNodes) {
			const content = await parse_node_tree(contentNode as HTMLElement);
			chapterContents.push(content);
		}

		const chapter: FIMChapter = {
			Title: chapterName,
			Contents: chapterContents,
		};

		story.Content.push(chapter);
	}

	return story;
}
