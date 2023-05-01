import { FIMStory } from './types.js';

declare function export_default(content: Buffer): Promise<FIMStory>;

export { export_default as default };
