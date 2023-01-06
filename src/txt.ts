import { FIMChapter, FIMStory } from './types';

export default function (content: string): FIMStory {
	// NOTE: FiMFetch has this issue where exported .txts would end up in one line
	// You can obviously "fix" this by downloading the .html format instead - or using FiMFiction's file if it exists.
	// But let's try our best to parse it still.

	// Replace tabs with newlines (notable if using FiMFetch)
	let content_parsed = content.replace(/\t/g, '\n').split('\n');
	// Remove carriage returns and empty lines
	// TODO: Maybe remove the .filter()?
	content_parsed = content_parsed.map((x) => x.replace('\r', '').trim()).filter((x) => x !== '');

	let story: FIMStory = {
		Format: 'FIMFICTION',
		Title: '',
		Author: '',
		Content: [],
	};

	let fix_slash = false;
	let format: 'SLASH' | 'ARROW' = 'SLASH';
	if (content_parsed[0].startsWith(`//------------------------------//`)) {
		// - FiMFetch
		if (content_parsed[0].startsWith(`//------------------------------////`)) {
			// FIXME: Incredibly cursed and probably unstable.
			content_parsed = content_parsed
				.join('\n')
				.replace(/.\/\/------------------------------\/\//g, `\n//------------------------------//`)
				.replace(/\/\/------------------------------\/\/\s{4,}/g, `//------------------------------//\n`)
				.replace(/\s{18,20}/g, ' ')
				.split('\n');

			fix_slash = true;
		}

		format = 'SLASH';
	} else if (content_parsed[0].startsWith('> ')) {
		format = 'ARROW';
	} else {
		return {
			Format: 'NONE',
			Content: content_parsed,
		};
	}

	let chapter_title_buffer = '';
	let chapter_content_buffer: string[] = [];

	if (format === 'ARROW') {
		// Title and Author

		// > {TITLE}
		// >  by {AUTHOR}
		story.Title = content_parsed[0].substring(2).trim();
		story.Author = content_parsed[1].substring(6).trim();

		// Chapters
		for (let i = 3; i < content_parsed.length; i++) {
			const line = content_parsed[i];

			if (line.startsWith('> ') && content_parsed[i + 1].startsWith('> -----')) {
				if (chapter_content_buffer.length) {
					const chapter: FIMChapter = {
						Title: chapter_title_buffer.trim(),
						Contents: chapter_content_buffer,
					};

					story.Content.push(chapter);

					chapter_content_buffer = [];
					chapter_title_buffer = '';
				}

				chapter_title_buffer = line.substring(2);
				i = i + 1;
				continue;
			}

			chapter_content_buffer.push(line);
		}
	} else if (format === 'SLASH') {
		// Title and Author

		// // {TITLE}// by {AUTHOR}
		let fixed_header = (fix_slash ? content_parsed[0].substring(34) : content_parsed[1]).split('//').slice(1);
		story.Title = fixed_header[0].substring(1).trim();
		story.Author = fixed_header[1].substring(1 + 3).trim();

		// Chapters
		let chapter_start = 2;

		for (let i = chapter_start; i < content_parsed.length; i++) {
			const line = content_parsed[i];

			if (line.startsWith(`//------------------------------//`)) {
				if (chapter_content_buffer.length) {
					const chapter: FIMChapter = {
						Title: chapter_title_buffer.trim(),
						Contents: chapter_content_buffer,
					};

					story.Content.push(chapter);

					chapter_content_buffer = [];
					chapter_title_buffer = '';
				}

				chapter_title_buffer = content_parsed[i + 1].substring(3);
				i = i + 2;
				continue;
			}

			chapter_content_buffer.push(line);
		}
	}

	if (chapter_content_buffer.length) {
		const chapter: FIMChapter = {
			Title: chapter_title_buffer.trim(),
			Contents: chapter_content_buffer,
		};

		story.Content.push(chapter);

		chapter_content_buffer = [];
		chapter_title_buffer = '';
	}

	return story;
}
