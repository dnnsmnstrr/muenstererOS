import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const llmsTxt = fs.readFileSync(path.join(__dirname, '../static/llms.txt'), 'utf-8');

// https://llmstxt.org/llmstxt-js.html
function parseLLMsTxt(txt) {
	function parseLinks(links) {
		const linkPat = /-\s*\[(?<title>[^\]]+)\]\((?<url>[^\)]+)\)(?::\s*(?<desc>.*?))?$/gm;
		return Array.from(links.matchAll(linkPat)).map((match) => match.groups);
	}

	const [start, ...rest] = txt.split(/^##\s*(.*?)$/m);
	const sections = Object.fromEntries(
		Array.from({ length: Math.floor(rest.length / 2) }, (_, i) => [
			rest[i * 2],
			parseLinks(rest[i * 2 + 1])
		])
	);

	const pat = /^#\s*(?<title>.+?$)\n+(?:^>\s*(?<summary>.+?$))?\n+(?<info>.*)/ms;
	const match = start.trim().match(pat);
	const result = { ...match.groups, sections };

	return result;
}

const llmsData = parseLLMsTxt(llmsTxt);
const llmsJson = JSON.stringify(llmsData, null, 2);
fs.writeFileSync(path.join(__dirname, '../src/data/llms.json'), llmsJson);
console.log(`LLMs data parsed and saved to static/llms.json`);