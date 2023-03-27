"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/txt.ts
var txt_exports = {};
__export(txt_exports, {
  default: () => txt_default
});
module.exports = __toCommonJS(txt_exports);
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
    story.Title = content_parsed[0].substring(2).trim();
    story.Author = content_parsed[1].substring(6).trim();
    for (let i = 3; i < content_parsed.length; i++) {
      const line = content_parsed[i];
      if (line.startsWith("> ") && content_parsed[i + 1].startsWith("> -----")) {
        if (chapter_content_buffer.length) {
          const chapter = {
            Title: chapter_title_buffer.trim(),
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
    story.Title = fixed_header[0].substring(1).trim();
    story.Author = fixed_header[1].substring(1 + 3).trim();
    let chapter_start = 2;
    for (let i = chapter_start; i < content_parsed.length; i++) {
      const line = content_parsed[i];
      if (line.startsWith(`//------------------------------//`)) {
        if (chapter_content_buffer.length) {
          const chapter = {
            Title: chapter_title_buffer.trim(),
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
      Title: chapter_title_buffer.trim(),
      Contents: chapter_content_buffer
    };
    story.Content.push(chapter);
    chapter_content_buffer = [];
    chapter_title_buffer = "";
  }
  return story;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
