import { HTMLElement } from 'node-html-parser';
import { FIMChapterContent, FIMStory } from './types.js';

declare function parse_node_tree(el: HTMLElement): Promise<FIMChapterContent>;
declare function export_default(content: string): Promise<FIMStory>;

export { export_default as default, parse_node_tree };
