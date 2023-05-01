import fs from 'fs';
import path from 'path';
import fimfic from './index';

const [test_file] = process.argv.splice(2);

async function main() {
	if (!fs.existsSync(test_file)) return;
	const test_file_path = path.dirname(test_file);
	const test_file_name = path.basename(test_file, path.extname(test_file));
	const test_output_path = path.join(test_file_path, test_file_name);

	const story = await fimfic(fs.readFileSync(test_file, 'utf-8'));

	fs.writeFileSync(test_output_path + '.json', JSON.stringify(story, null, '\t'));
}

main().catch(console.error);
