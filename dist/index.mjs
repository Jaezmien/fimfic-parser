import {
  html_default
} from "./chunk-LXX7EPIF.mjs";
import {
  txt_default
} from "./chunk-3MIMW33Q.mjs";
import {
  __async
} from "./chunk-MYWZT2KK.mjs";
import "./chunk-WBQAMGXK.mjs";

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
