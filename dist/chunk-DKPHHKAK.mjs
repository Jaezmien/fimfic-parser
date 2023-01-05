import {
  __async
} from "./chunk-MYWZT2KK.mjs";

// src/html.ts
import { parse as parse_html } from "node-html-parser";
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
    const story = {
      Format: "HTML",
      Author: "",
      Title: "",
      Content: []
    };
    const dom = parse_html(content);
    story.Title = dom.querySelector("header h1 a").textContent;
    story.Author = dom.querySelector("header h2 a").textContent;
    for (const chapterNode of dom.querySelectorAll("article.chapter")) {
      const chapterName = Array.from(chapterNode.querySelector("header h1").childNodes).find((n) => n.nodeType === 3).toString();
      const chapterContentNodes = Array.from(chapterNode.childNodes);
      while (chapterContentNodes[0].toString().startsWith("<header>") || !chapterContentNodes[0].toString().trim())
        chapterContentNodes.shift();
      while (chapterContentNodes[chapterContentNodes.length - 1].toString().startsWith("<footer>") || !chapterContentNodes[chapterContentNodes.length - 1].toString().trim())
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
    return story;
  });
}

export {
  html_default
};
