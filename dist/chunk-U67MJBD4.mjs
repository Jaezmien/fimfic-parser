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
    let chapter_start = fix_slash ? 3 : 4;
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

export {
  txt_default
};
