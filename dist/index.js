"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);

// src/html.ts
var import_node_html_parser = __toESM(require("node-html-parser"));
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
    const dom = (0, import_node_html_parser.default)(content);
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

// src/txt.ts
function txt_default(content) {
  let content_parsed = content.replace(/\t/g, "\n").split("\n");
  content_parsed = content_parsed.map((x) => x.replace("\r", "").trim()).filter((x) => x !== "");
  let story = {
    Format: "FIMFICTION",
    Title: "",
    Author: "",
    Content: []
  };
  let fix_slash = false;
  let format = "SLASH";
  if (content_parsed[0].startsWith(`//------------------------------//`)) {
    if (content_parsed[0].startsWith(`//------------------------------////`)) {
      content_parsed = content_parsed.join("\n").replace(/.\/\/------------------------------\/\//g, `
//------------------------------//`).replace(/\/\/------------------------------\/\/\s{4,}/g, `//------------------------------//
`).replace(/\s{18,20}/g, " ").split("\n");
      fix_slash = true;
    }
    format = "SLASH";
  } else if (content_parsed[0].startsWith("> ")) {
    format = "ARROW";
  } else {
    return {
      Format: "NONE",
      Content: content_parsed
    };
  }
  let chapter_title_buffer = "";
  let chapter_content_buffer = [];
  if (format === "ARROW") {
    story.Title = content_parsed[0].substring(2);
    story.Author = content_parsed[1].substring(6);
    for (let i = 3; i < content_parsed.length; i++) {
      const line = content_parsed[i];
      if (line.startsWith("> ") && content_parsed[i + 1].startsWith("> -----")) {
        if (chapter_content_buffer.length) {
          const chapter = {
            Title: chapter_title_buffer,
            Contents: chapter_content_buffer
          };
          story.Content.push(chapter);
          chapter_content_buffer = [];
          chapter_title_buffer = "";
        }
        chapter_title_buffer = line.substring(2);
        i = i + 1;
        continue;
      }
      chapter_content_buffer.push(line);
    }
  } else if (format === "SLASH") {
    let fixed_header = (fix_slash ? content_parsed[0].substring(34) : content_parsed[1]).split("//").slice(1);
    story.Title = fixed_header[0].substring(1);
    story.Author = fixed_header[1].substring(1 + 3);
    let chapter_start = fix_slash ? 2 : 3;
    for (let i = chapter_start; i < content_parsed.length; i++) {
      const line = content_parsed[i];
      if (!line.startsWith(`//------------------------------//`)) {
        if (chapter_content_buffer.length) {
          const chapter = {
            Title: chapter_title_buffer,
            Contents: chapter_content_buffer
          };
          story.Content.push(chapter);
          chapter_content_buffer = [];
          chapter_title_buffer = "";
        }
        chapter_title_buffer = content_parsed[i + 1].substring(3);
        i = i + 2;
        continue;
      }
      chapter_content_buffer.push(line);
    }
  }
  if (chapter_content_buffer.length) {
    const chapter = {
      Title: chapter_title_buffer,
      Contents: chapter_content_buffer
    };
    story.Content.push(chapter);
    chapter_content_buffer = [];
    chapter_title_buffer = "";
  }
  return story;
}

// src/index.ts
function src_default(content) {
  return __async(this, null, function* () {
    if (content.startsWith("<!DOCTYPE html>") || content.startsWith("<html>")) {
      return yield html_default(content);
    } else {
      return txt_default(content);
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
