import {
  src_default
} from "./chunk-RZ2THWGB.js";
import "./chunk-WF6ZLC2U.js";
import "./chunk-4T37X6RP.js";
import {
  __async
} from "./chunk-RDTRUTC6.js";
import "./chunk-6F4PWJZI.js";

// src/parse.ts
import fs from "fs";
import path from "path";
var [test_file] = process.argv.splice(2);
function main() {
  return __async(this, null, function* () {
    if (!fs.existsSync(test_file))
      return;
    const test_file_path = path.dirname(test_file);
    const test_file_name = path.basename(test_file, path.extname(test_file));
    const test_output_path = path.join(test_file_path, test_file_name);
    const story = yield src_default(fs.readFileSync(test_file, "utf-8"));
    fs.writeFileSync(test_output_path + ".json", JSON.stringify(story, null, "	"));
  });
}
main().catch(console.error);
