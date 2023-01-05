import { FIMStory } from './types.js';
export { FIMChapter, FIMChapterContent, FIMChapterContents, FIMChapterNode, FIMFormat } from './types.js';

declare function export_default(content: string): Promise<FIMStory>;

export { FIMStory, export_default as default };
