import {
  epub_default
} from "./chunk-OOFJKYXT.js";
import {
  html_default
} from "./chunk-TH3QX3TM.js";
import {
  txt_default
} from "./chunk-4T37X6RP.js";
import {
  __async
} from "./chunk-5BKUTXDD.js";

// src/index.ts
function src_default(content) {
  return __async(this, null, function* () {
    if (typeof content === "string") {
      if (content.startsWith("<!DOCTYPE html>") || content.startsWith("<html>")) {
        return yield html_default(content);
      } else {
        return txt_default(content);
      }
    } else {
      return yield epub_default(content);
    }
  });
}

export {
  src_default
};
