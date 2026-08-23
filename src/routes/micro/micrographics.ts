/**
 * Micrographics generator.
 *
 * Builds dense, technical SVG artwork from a small set of parameters.
 * Everything is deterministic: the same config always produces the same SVG,
 * so a seed can be shared like a preset.
 */

export type TemplateId = 'coordinates' | 'header' | 'matrix' | 'target';

export type MarkId = 'crosshair' | 'ring' | 'square' | 'triangle' | 'bars' | 'arrow' | 'dots';

export interface MicroConfig {
	template: TemplateId;
	seed: number;
	density: number;
	strokeWidth: number;
	marks: MarkId[];
	accentRatio: number;
	showGrid: boolean;
	showLabels: boolean;
	title: string;
	subtitle: string;
	code: string;
	footer: string;
	background: string;
	ink: string;
	accent: string;
}

export interface TemplateMeta {
	id: TemplateId;
	label: string;
	width: number;
	height: number;
}

export const templates: TemplateMeta[] = [
	{ id: 'coordinates', label: 'Coordinates', width: 800, height: 1000 },
	{ id: 'header', label: 'Header band', width: 1200, height: 400 },
	{ id: 'matrix', label: 'Matrix', width: 900, height: 900 },
	{ id: 'target', label: 'Target', width: 900, height: 900 }
];

export const allMarks: MarkId[] = ['crosshair', 'ring', 'square', 'triangle', 'bars', 'arrow', 'dots'];

export const defaultConfig: MicroConfig = {
	template: 'coordinates',
	seed: 4271,
	density: 5,
	strokeWidth: 1.2,
	marks: ['crosshair', 'ring', 'square', 'bars'],
	accentRatio: 0.18,
	showGrid: true,
	showLabels: true,
	title: 'MICROGRAPHICS',
	subtitle: 'svg drawing system',
	code: 'MG-01 / REV.A',
	footer: 'muensterer.tech/micro',
	background: '#0d0f12',
	ink: '#e6e8ea',
	accent: '#e4483d'
};

/** Small deterministic PRNG so a seed reproduces an exact drawing. */
function rng(seed: number) {
	let a = seed >>> 0;
	return () => {
		a += 0x6d2b79f5;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const pad = (n: number, size = 2) => String(Math.round(n)).padStart(size, '0');
const fmt = (n: number) => Math.round(n * 100) / 100;

function mark(kind: MarkId, x: number, y: number, size: number, color: string, stroke: number) {
	const s = size / 2;
	const common = `fill="none" stroke="${color}" stroke-width="${stroke}"`;
	switch (kind) {
		case 'crosshair':
			return `<g ${common}><line x1="${fmt(x - s)}" y1="${fmt(y)}" x2="${fmt(x + s)}" y2="${fmt(y)}"/><line x1="${fmt(x)}" y1="${fmt(y - s)}" x2="${fmt(x)}" y2="${fmt(y + s)}"/><circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(s * 0.45)}"/></g>`;
		case 'ring':
			return `<g ${common}><circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(s)}"/><circle cx="${fmt(x)}" cy="${fmt(y)}" r="${fmt(s * 0.4)}"/></g>`;
		case 'square':
			return `<g ${common}><rect x="${fmt(x - s)}" y="${fmt(y - s)}" width="${fmt(size)}" height="${fmt(size)}"/><line x1="${fmt(x - s)}" y1="${fmt(y - s)}" x2="${fmt(x + s)}" y2="${fmt(y + s)}"/></g>`;
		case 'triangle':
			return `<polygon points="${fmt(x)},${fmt(y - s)} ${fmt(x + s)},${fmt(y + s)} ${fmt(x - s)},${fmt(y + s)}" ${common}/>`;
		case 'bars': {
			const bars = [0.35, 0.7, 1, 0.55]
				.map((h, i) => {
					const bx = x - s + (i * size) / 4;
					return `<line x1="${fmt(bx)}" y1="${fmt(y + s)}" x2="${fmt(bx)}" y2="${fmt(y + s - size * h)}"/>`;
				})
				.join('');
			return `<g ${common}>${bars}</g>`;
		}
		case 'arrow':
			return `<g ${common}><line x1="${fmt(x - s)}" y1="${fmt(y + s)}" x2="${fmt(x + s)}" y2="${fmt(y - s)}"/><polyline points="${fmt(x + s - size * 0.4)},${fmt(y - s)} ${fmt(x + s)},${fmt(y - s)} ${fmt(x + s)},${fmt(y - s + size * 0.4)}"/></g>`;
		case 'dots': {
			const dots: string[] = [];
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					dots.push(
						`<circle cx="${fmt(x - s + (i * size) / 2)}" cy="${fmt(y - s + (j * size) / 2)}" r="${fmt(stroke)}" fill="${color}"/>`
					);
				}
			}
			return `<g>${dots.join('')}</g>`;
		}
	}
}

function gridLines(w: number, h: number, step: number, color: string, stroke: number) {
	const lines: string[] = [];
	for (let x = step; x < w; x += step) {
		lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`);
	}
	for (let y = step; y < h; y += step) {
		lines.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`);
	}
	return `<g stroke="${color}" stroke-width="${stroke * 0.4}" opacity="0.28">${lines.join('')}</g>`;
}

function ticks(
	x: number,
	y: number,
	length: number,
	count: number,
	vertical: boolean,
	color: string,
	stroke: number
) {
	const out: string[] = [];
	for (let i = 0; i <= count; i++) {
		const t = (i / count) * length;
		const long = i % 5 === 0;
		const size = long ? 10 : 5;
		out.push(
			vertical
				? `<line x1="${fmt(x)}" y1="${fmt(y + t)}" x2="${fmt(x + size)}" y2="${fmt(y + t)}"/>`
				: `<line x1="${fmt(x + t)}" y1="${fmt(y)}" x2="${fmt(x + t)}" y2="${fmt(y - size)}"/>`
		);
	}
	return `<g stroke="${color}" stroke-width="${stroke}">${out.join('')}</g>`;
}

function label(text: string, x: number, y: number, size: number, color: string, opacity = 1) {
	return `<text x="${fmt(x)}" y="${fmt(y)}" font-family="'Fira Mono', ui-monospace, monospace" font-size="${size}" fill="${color}" opacity="${opacity}" letter-spacing="1.5">${escapeText(text)}</text>`;
}

function escapeText(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function scatter(config: MicroConfig, w: number, h: number, box: [number, number, number, number]) {
	const random = rng(config.seed + 17);
	const marks = config.marks.length ? config.marks : ['crosshair' as MarkId];
	const [bx, by, bw, bh] = box;
	const count = Math.round(config.density * 7);
	const out: string[] = [];
	for (let i = 0; i < count; i++) {
		const kind = marks[Math.floor(random() * marks.length)];
		const x = bx + random() * bw;
		const y = by + random() * bh;
		const size = 8 + random() * 26;
		const color = random() < config.accentRatio ? config.accent : config.ink;
		out.push(mark(kind, x, y, size, color, config.strokeWidth));
		if (config.showLabels && random() > 0.6) {
			out.push(
				label(
					`${pad(x / 10, 3)}.${pad(y / 10, 3)}`,
					x + size / 2 + 4,
					y + 3,
					7,
					color,
					0.65
				)
			);
		}
	}
	return out.join('');
}

function coordinates(config: MicroConfig, w: number, h: number) {
	const random = rng(config.seed);
	const parts: string[] = [];
	if (config.showGrid) parts.push(gridLines(w, h, 40, config.ink, config.strokeWidth));
	parts.push(
		`<rect x="40" y="40" width="${w - 80}" height="${h - 80}" fill="none" stroke="${config.ink}" stroke-width="${config.strokeWidth}"/>`
	);
	parts.push(ticks(40, 40, h - 80, 40, true, config.ink, config.strokeWidth));
	parts.push(ticks(40, h - 40, w - 80, 40, false, config.ink, config.strokeWidth));
	// radial sweep
	const cx = w * 0.5;
	const cy = h * 0.42;
	for (let r = 60; r < w * 0.45; r += 45) {
		parts.push(
			`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${config.ink}" stroke-width="${config.strokeWidth * 0.6}" stroke-dasharray="2 6" opacity="0.7"/>`
		);
	}
	for (let a = 0; a < 360; a += 15) {
		const rad = (a * Math.PI) / 180;
		const r1 = w * 0.45;
		const r2 = r1 + (a % 45 === 0 ? 16 : 8);
		parts.push(
			`<line x1="${fmt(cx + Math.cos(rad) * r1)}" y1="${fmt(cy + Math.sin(rad) * r1)}" x2="${fmt(cx + Math.cos(rad) * r2)}" y2="${fmt(cy + Math.sin(rad) * r2)}" stroke="${a % 90 === 0 ? config.accent : config.ink}" stroke-width="${config.strokeWidth}"/>`
		);
	}
	parts.push(
		`<line x1="40" y1="${fmt(cy)}" x2="${w - 40}" y2="${fmt(cy)}" stroke="${config.accent}" stroke-width="${config.strokeWidth}" stroke-dasharray="14 6"/>`
	);
	parts.push(scatter(config, w, h, [70, 70, w - 140, h - 260]));
	// title block
	const ty = h - 150;
	parts.push(
		`<rect x="40" y="${ty}" width="${w - 80}" height="110" fill="none" stroke="${config.ink}" stroke-width="${config.strokeWidth}"/>`
	);
	parts.push(`<line x1="40" y1="${ty + 44}" x2="${w - 40}" y2="${ty + 44}" stroke="${config.ink}" stroke-width="${config.strokeWidth * 0.6}" opacity="0.6"/>`);
	parts.push(label(config.title, 60, ty + 32, 26, config.ink));
	parts.push(label(config.subtitle, 60, ty + 70, 12, config.ink, 0.8));
	parts.push(label(config.code, 60, ty + 94, 11, config.accent));
	parts.push(label(config.footer, w - 60 - config.footer.length * 6.4, ty + 94, 11, config.ink, 0.6));
	if (config.showLabels) {
		for (let i = 0; i < 8; i++) {
			parts.push(label(`${pad(random() * 99)}`, 48, 70 + i * ((h - 300) / 8), 8, config.ink, 0.5));
		}
	}
	return parts.join('');
}

function header(config: MicroConfig, w: number, h: number) {
	const random = rng(config.seed + 3);
	const parts: string[] = [];
	if (config.showGrid) parts.push(gridLines(w, h, 50, config.ink, config.strokeWidth));
	parts.push(
		`<rect x="30" y="30" width="${w - 60}" height="${h - 60}" fill="none" stroke="${config.ink}" stroke-width="${config.strokeWidth}"/>`
	);
	parts.push(ticks(30, h - 60, w - 60, 60, false, config.ink, config.strokeWidth));
	parts.push(
		`<line x1="30" y1="${h * 0.63}" x2="${w - 30}" y2="${h * 0.63}" stroke="${config.accent}" stroke-width="${config.strokeWidth * 1.5}"/>`
	);
	parts.push(label(config.title, 60, h * 0.4, 62, config.ink));
	parts.push(label(config.subtitle, 62, h * 0.49, 14, config.ink, 0.75));
	parts.push(label(config.code, 60, h - 78, 12, config.accent));
	parts.push(label(config.footer, w - 60 - config.footer.length * 7, h - 78, 12, config.ink, 0.6));
	const marks = config.marks.length ? config.marks : ['ring' as MarkId];
	const count = Math.round(config.density * 4);
	for (let i = 0; i < count; i++) {
		const kind = marks[i % marks.length];
		const x = 80 + ((w - 160) / count) * i + random() * 10;
		const y = h * 0.63 - 20 - random() * 22;
		const color = random() < config.accentRatio ? config.accent : config.ink;
		parts.push(mark(kind, x, y, 10 + random() * 18, color, config.strokeWidth));
	}
	return parts.join('');
}

function matrix(config: MicroConfig, w: number, h: number) {
	const random = rng(config.seed + 91);
	const parts: string[] = [];
	const cols = Math.max(3, Math.round(config.density * 1.6));
	const rows = cols;
	const pad0 = 70;
	const cellW = (w - pad0 * 2) / cols;
	const cellH = (h - pad0 * 2 - 90) / rows;
	const marks = config.marks.length ? config.marks : ['square' as MarkId];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const x = pad0 + c * cellW + cellW / 2;
			const y = pad0 + r * cellH + cellH / 2;
			if (config.showGrid) {
				parts.push(
					`<rect x="${fmt(pad0 + c * cellW)}" y="${fmt(pad0 + r * cellH)}" width="${fmt(cellW)}" height="${fmt(cellH)}" fill="none" stroke="${config.ink}" stroke-width="${config.strokeWidth * 0.4}" opacity="0.35"/>`
				);
			}
			if (random() > 0.22) {
				const kind = marks[Math.floor(random() * marks.length)];
				const color = random() < config.accentRatio ? config.accent : config.ink;
				parts.push(mark(kind, x, y, Math.min(cellW, cellH) * 0.5, color, config.strokeWidth));
			}
			if (config.showLabels && random() > 0.75) {
				parts.push(label(`${pad(c)}${pad(r)}`, pad0 + c * cellW + 4, pad0 + r * cellH + 12, 8, config.ink, 0.55));
			}
		}
	}
	parts.push(
		`<rect x="${pad0}" y="${pad0}" width="${fmt(cellW * cols)}" height="${fmt(cellH * rows)}" fill="none" stroke="${config.ink}" stroke-width="${config.strokeWidth}"/>`
	);
	parts.push(label(config.title, pad0, h - 74, 30, config.ink));
	parts.push(label(config.subtitle, pad0 + 2, h - 50, 12, config.ink, 0.75));
	parts.push(label(config.code, pad0 + 2, h - 30, 11, config.accent));
	parts.push(label(config.footer, w - pad0 - config.footer.length * 6.4, h - 30, 11, config.ink, 0.6));
	return parts.join('');
}

function target(config: MicroConfig, w: number, h: number) {
	const random = rng(config.seed + 55);
	const parts: string[] = [];
	const cx = w / 2;
	const cy = h / 2 - 30;
	if (config.showGrid) parts.push(gridLines(w, h, 45, config.ink, config.strokeWidth));
	const rings = Math.max(4, Math.round(config.density * 1.3));
	for (let i = 1; i <= rings; i++) {
		const r = (i / rings) * (Math.min(w, h) * 0.4);
		parts.push(
			`<circle cx="${cx}" cy="${cy}" r="${fmt(r)}" fill="none" stroke="${i === rings ? config.accent : config.ink}" stroke-width="${config.strokeWidth * (i === rings ? 1.4 : 0.8)}" ${i % 2 ? '' : 'stroke-dasharray="3 5"'}/>`
		);
		if (config.showLabels) parts.push(label(`R${pad(i)}`, cx + 4, cy - r - 5, 8, config.ink, 0.6));
	}
	for (let a = 0; a < 360; a += 10) {
		const rad = (a * Math.PI) / 180;
		const r1 = Math.min(w, h) * 0.4;
		const r2 = r1 + (a % 30 === 0 ? 18 : 9);
		parts.push(
			`<line x1="${fmt(cx + Math.cos(rad) * r1)}" y1="${fmt(cy + Math.sin(rad) * r1)}" x2="${fmt(cx + Math.cos(rad) * r2)}" y2="${fmt(cy + Math.sin(rad) * r2)}" stroke="${config.ink}" stroke-width="${config.strokeWidth}"/>`
		);
	}
	parts.push(`<line x1="60" y1="${cy}" x2="${w - 60}" y2="${cy}" stroke="${config.ink}" stroke-width="${config.strokeWidth * 0.6}" opacity="0.7"/>`);
	parts.push(`<line x1="${cx}" y1="60" x2="${cx}" y2="${h - 120}" stroke="${config.ink}" stroke-width="${config.strokeWidth * 0.6}" opacity="0.7"/>`);
	const marks = config.marks.length ? config.marks : ['crosshair' as MarkId];
	const count = Math.round(config.density * 3);
	for (let i = 0; i < count; i++) {
		const a = random() * Math.PI * 2;
		const r = Math.min(w, h) * 0.36 * Math.sqrt(random());
		const x = cx + Math.cos(a) * r;
		const y = cy + Math.sin(a) * r;
		const color = random() < config.accentRatio ? config.accent : config.ink;
		parts.push(mark(marks[Math.floor(random() * marks.length)], x, y, 10 + random() * 20, color, config.strokeWidth));
	}
	parts.push(label(config.title, 60, h - 80, 28, config.ink));
	parts.push(label(config.subtitle, 62, h - 58, 12, config.ink, 0.75));
	parts.push(label(config.code, 62, h - 38, 11, config.accent));
	parts.push(label(config.footer, w - 60 - config.footer.length * 6.4, h - 38, 11, config.ink, 0.6));
	return parts.join('');
}

const renderers: Record<TemplateId, (config: MicroConfig, w: number, h: number) => string> = {
	coordinates,
	header,
	matrix,
	target
};

export function getTemplate(id: TemplateId): TemplateMeta {
	return templates.find((t) => t.id === id) ?? templates[0];
}

/** Render the full SVG document for a config. */
export function renderSvg(config: MicroConfig): string {
	const { width, height } = getTemplate(config.template);
	const body = renderers[config.template](config, width, height);
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeText(config.title)} micrographic">`,
		`<rect width="${width}" height="${height}" fill="${config.background}"/>`,
		body,
		'</svg>'
	].join('');
}
