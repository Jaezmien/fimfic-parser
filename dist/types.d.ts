type FIMFormat = 'NONE' | 'FIMFICTION' | 'HTML' | 'EPUB';
type FIMStory = {
    Format: 'NONE';
    Content: string[];
} | {
    Format: Exclude<FIMFormat, 'NONE'>;
    Title: string;
    Author: string;
    Content: FIMChapter[];
};
type FIMChapterContent = string | FIMChapterNode;
type FIMChapterContents = FIMChapterContent[];
interface FIMChapter {
    Title: string;
    Contents: FIMChapterContents;
}
interface FIMChapterNode {
    tag: string;
    attributes?: {
        [key: string]: any;
    };
    children?: FIMChapterContents;
    data?: string;
}

export { FIMChapter, FIMChapterContent, FIMChapterContents, FIMChapterNode, FIMFormat, FIMStory };
