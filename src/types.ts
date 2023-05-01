export type FIMFormat = 'NONE' | 'FIMFICTION' | 'HTML' | 'EPUB';

export type FIMStory =
	| {
			Format: 'NONE';
			Content: string[];
	  }
	| {
			Format: Exclude<FIMFormat, 'NONE'>;
			Title: string;
			Author: string;
			Content: FIMChapter[];
	  };

export type FIMChapterContent = string | FIMChapterNode;
export type FIMChapterContents = FIMChapterContent[];
export interface FIMChapter {
	Title: string;
	Contents: FIMChapterContents;
}
export interface FIMChapterNode {
	tag: string;
	attributes?: { [key: string]: any };
	children?: FIMChapterContents;
	data?: string;
}
