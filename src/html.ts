import { HTMLElement, NodeType, parse as parse_html } from 'node-html-parser';
import { FIMChapter, FIMChapterContent, FIMChapterContents, FIMChapterNode, FIMStory } from './types';

export async function parse_node_tree(el: HTMLElement): Promise<FIMChapterContent> {
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

		if (tree.attributes.src) {
			// Adjust camo.fimfiction.net links
			let u = new URL(tree.attributes.src);
			if (u.host === 'camo.fimfiction.net')
				tree.attributes.src = u.searchParams.get('url') || tree.attributes.src;
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

	const is_single_chapter = !dom.querySelector('header h1 a') && !dom.querySelector('header h2 a');
	if (is_single_chapter) {
		story.Title = dom.querySelector('h1 a')!.textContent;
		story.Author = dom.querySelector('h2 a')!.textContent;

		const chapterName = dom.querySelector('h3')!.textContent;
		const chapterContents: FIMChapterContents = [];

		// Fortunately, we don't have any author's notes here.

		let currentNode = dom.querySelector('h3')!.nextElementSibling;
		while (currentNode) {
			const content = await parse_node_tree(currentNode as unknown as HTMLElement);
			chapterContents.push(content);
			currentNode = currentNode.nextElementSibling;
		}

		const chapter: FIMChapter = {
			Title: chapterName,
			Contents: chapterContents,
		};

		story.Content.push(chapter);
	} else {
		story.Title = dom.querySelector('header h1 a')!.textContent;
		story.Author = dom.querySelector('header h2 a')!.textContent;

		for (const chapterNode of dom.querySelectorAll('article.chapter') as unknown as Array<HTMLElement>) {
			// Grabs chapter name from a header.

			// <header>
			// 		<h1><a name='{INDEX}'></a>{CHAPTER_NAME}</h1>
			const chapterName = Array.from(chapterNode.querySelector('header h1')!.childNodes)
				.find((n) => n.nodeType === 3)!
				.toString();

			// Removes <header>, <footer>, and empty nodes
			const chapterContentNodes = Array.from(chapterNode.childNodes);
			while (
				(chapterContentNodes[0] as HTMLElement).classList?.contains('authors-note') ||
				(chapterContentNodes[0] as HTMLElement).rawTagName === 'header' ||
				(!chapterContentNodes[0].rawText.trim() && chapterContentNodes[0].nodeType === NodeType.TEXT_NODE)
			)
				chapterContentNodes.shift();

			while (
				(chapterContentNodes[chapterContentNodes.length - 1] as HTMLElement).classList?.contains(
					'authors-note'
				) ||
				(chapterContentNodes[chapterContentNodes.length - 1] as HTMLElement).rawTagName === 'footer' ||
				(!chapterContentNodes[chapterContentNodes.length - 1].rawText.trim() &&
					chapterContentNodes[chapterContentNodes.length - 1].nodeType === NodeType.TEXT_NODE)
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
	}

	return story;
}
