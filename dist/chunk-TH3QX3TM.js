import {
  __async
} from "./chunk-5BKUTXDD.js";

// src/html.ts
import { NodeType, parse as parse_html } from "node-html-parser";
function parse_node_tree(el) {
  return __async(this, null, function* () {
    var _a;
    if (el.nodeType === 3) {
      return el.textContent;
    }
    const tree = { tag: el.tagName.toLowerCase() };
    if (Object.keys(el.attributes).length) {
      tree.attributes = {};
      for (const [key, attribute] of Object.entries(el.attributes)) {
        tree.attributes[key] = attribute.toString();
      }
      if (tree.attributes.src) {
        let u = new URL(tree.attributes.src);
        if (u.host === "camo.fimfiction.net")
          tree.attributes.src = u.searchParams.get("url") || tree.attributes.src;
      }
    }
    if (el.childNodes.length) {
      if (el.childNodes.length === 1 && ((_a = el.firstChild) == null ? void 0 : _a.nodeType) === 3) {
        if (tree.tag === "p")
          return yield parse_node_tree(el.firstChild);
        else
          tree.data = yield parse_node_tree(el.firstChild);
      } else {
        tree.children = [];
        for (const child of el.childNodes) {
          tree.children.push(yield parse_node_tree(child));
        }
      }
    }
    return tree;
  });
}
function html_default(content) {
  return __async(this, null, function* () {
    var _a, _b;
    const story = {
      Format: "HTML",
      Author: "",
      Title: "",
      Content: []
    };
    const dom = parse_html(content);
    const is_single_chapter = !dom.querySelector("header h1 a") && !dom.querySelector("header h2 a");
    if (is_single_chapter) {
      story.Title = dom.querySelector("h1 a").textContent;
      story.Author = dom.querySelector("h2 a").textContent;
      const chapterName = dom.querySelector("h3").textContent;
      const chapterContents = [];
      let currentNode = dom.querySelector("h3").nextElementSibling;
      while (currentNode) {
        const content2 = yield parse_node_tree(currentNode);
        chapterContents.push(content2);
        currentNode = currentNode.nextElementSibling;
      }
      const chapter = {
        Title: chapterName,
        Contents: chapterContents
      };
      story.Content.push(chapter);
    } else {
      story.Title = dom.querySelector("header h1 a").textContent;
      story.Author = dom.querySelector("header h2 a").textContent;
      for (const chapterNode of dom.querySelectorAll("article.chapter")) {
        const chapterName = Array.from(chapterNode.querySelector("header h1").childNodes).find((n) => n.nodeType === 3).toString();
        const chapterContentNodes = Array.from(chapterNode.childNodes);
        while (((_a = chapterContentNodes[0].classList) == null ? void 0 : _a.contains("authors-note")) || chapterContentNodes[0].rawTagName === "header" || !chapterContentNodes[0].rawText.trim() && chapterContentNodes[0].nodeType === NodeType.TEXT_NODE)
          chapterContentNodes.shift();
        while (((_b = chapterContentNodes[chapterContentNodes.length - 1].classList) == null ? void 0 : _b.contains(
          "authors-note"
        )) || chapterContentNodes[chapterContentNodes.length - 1].rawTagName === "footer" || !chapterContentNodes[chapterContentNodes.length - 1].rawText.trim() && chapterContentNodes[chapterContentNodes.length - 1].nodeType === NodeType.TEXT_NODE)
          chapterContentNodes.pop();
        const chapterContents = [];
        for (const contentNode of chapterContentNodes) {
          const content2 = yield parse_node_tree(contentNode);
          chapterContents.push(content2);
        }
        const chapter = {
          Title: chapterName,
          Contents: chapterContents
        };
        story.Content.push(chapter);
      }
    }
    return story;
  });
}

export {
  parse_node_tree,
  html_default
};
