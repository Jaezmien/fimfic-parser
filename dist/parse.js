import {
  src_default
} from "./chunk-4THUW3SA.js";
import "./chunk-OOFJKYXT.js";
import "./chunk-TH3QX3TM.js";
import "./chunk-4T37X6RP.js";
import {
  __async
} from "./chunk-5BKUTXDD.js";
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
    const test_file_extension = path.extname(test_file);
    const test_file_name = path.basename(test_file, test_file_extension);
    const test_output_path = path.join(test_file_path, test_file_name);
    const story = yield src_default(fs.readFileSync(test_file, test_file_extension === ".epub" ? null : "utf-8"));
    fs.writeFileSync(test_output_path + ".json", JSON.stringify(story, null, "	"));
  });
}
main().catch(console.error);
