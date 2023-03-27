import {
  html_default
} from "./chunk-WF6ZLC2U.js";
import {
  txt_default
} from "./chunk-4T37X6RP.js";
import {
  __async
} from "./chunk-RDTRUTC6.js";
import "./chunk-6F4PWJZI.js";

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
export {
  src_default as default
};
