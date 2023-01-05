var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "node-html-parser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const node_html_parser_1 = __importDefault(require("node-html-parser"));
    function parse_node_tree(el) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (el.nodeType === 3) {
                return el.textContent;
            }
            const tree = { tag: el.tagName.toLowerCase() };
            if (Object.keys(el.attributes).length) {
                tree.attributes = {};
                for (const [key, attribute] of Object.entries(el.attributes)) {
                    tree.attributes[key] = attribute.toString();
                }
            }
            if (el.childNodes.length) {
                if (el.childNodes.length === 1 && ((_a = el.firstChild) === null || _a === void 0 ? void 0 : _a.nodeType) === 3) {
                    if (tree.tag === 'p')
                        return (yield parse_node_tree(el.firstChild));
                    else
                        tree.data = (yield parse_node_tree(el.firstChild));
                }
                else {
                    tree.children = [];
                    for (const child of el.childNodes) {
                        tree.children.push(yield parse_node_tree(child));
                    }
                }
            }
            return tree;
        });
    }
    function default_1(content) {
        return __awaiter(this, void 0, void 0, function* () {
            const story = {
                Format: 'HTML',
                Author: '',
                Title: '',
                Content: [],
            };
            const dom = (0, node_html_parser_1.default)(content);
            story.Title = dom.querySelector('header h1 a').textContent;
            story.Author = dom.querySelector('header h2 a').textContent;
            for (const chapterNode of dom.querySelectorAll('article.chapter')) {
                const chapterName = Array.from(chapterNode.querySelector('header h1').childNodes)
                    .find((n) => n.nodeType === 3)
                    .toString();
                const chapterContentNodes = Array.from(chapterNode.childNodes);
                while (chapterContentNodes[0].toString().startsWith('<header>') || !chapterContentNodes[0].toString().trim())
                    chapterContentNodes.shift();
                while (chapterContentNodes[chapterContentNodes.length - 1].toString().startsWith('<footer>') ||
                    !chapterContentNodes[chapterContentNodes.length - 1].toString().trim())
                    chapterContentNodes.pop();
                const chapterContents = [];
                for (const contentNode of chapterContentNodes) {
                    const content = yield parse_node_tree(contentNode);
                    chapterContents.push(content);
                }
                const chapter = {
                    Title: chapterName,
                    Contents: chapterContents,
                };
                story.Content.push(chapter);
            }
            return story;
        });
    }
    exports.default = default_1;
});
