import confetti from 'canvas-confetti';

export type CheatCodeAnimation = 'stars' | 'money';

export interface CheatCode {
	id: string;
	sequence?: string[];
	code?: string;
	animation: CheatCodeAnimation;
}

export const CHEAT_CODES: CheatCode[] = [
	{
		id: 'konami', // https://en.wikipedia.org/wiki/Konami_Code
		sequence: [
			'ArrowUp',
			'ArrowUp',
			'ArrowDown',
			'ArrowDown',
			'ArrowLeft',
			'ArrowRight',
			'ArrowLeft',
			'ArrowRight',
			'b',
			'a'
		],
		animation: 'stars'
	},
	{
		id: 'motherlode',
		code: 'motherlode',
		animation: 'money'
	},
	{
		id: 'rosebud',
		code: 'rosebud',
		animation: 'money'
	},
	{
		id: 'hesoyam',
		code: 'hesoyam',
		animation: 'money'
	},
	{
		id: 'idkfa',
		code: 'idkfa',
		animation: 'stars'
	},
	{
		id: 'glitteringprizes',
		code: 'glitteringprizes',
		animation: 'money'
	},
	{
		id: 'klapaucius',
		code: 'klapaucius',
		animation: 'money'
	}
];

export function triggerStars() {
	const defaults = {
		spread: 360,
		ticks: 50,
		gravity: 0,
		decay: 0.94,
		startVelocity: 30,
		colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8']
	};

	function shoot() {
		confetti({
			...defaults,
			particleCount: 40,
			scalar: 1.2,
			shapes: ['star']
		});

		confetti({
			...defaults,
			particleCount: 10,
			scalar: 0.75,
			shapes: ['circle']
		});
	}

	setTimeout(shoot, 0);
	setTimeout(shoot, 150);
	setTimeout(shoot, 300);
	setTimeout(shoot, 450);
	setTimeout(shoot, 600);
}

export function triggerMoney() {
	confetti({
		spread: 180,
		angle: 270,
		origin: { x: 0.5, y: -0.2 },
		scalar: 2,
		ticks: 220,
		gravity: 1.2,
		decay: 0.96,
		startVelocity: 12,
		shapes: ['💰', '💵', '💴', '💶', '💷', '💸', '🪙'].map((emoji) => confetti.shapeFromText(emoji))
	});
}

export function triggerCheatAnimation(animation: CheatCodeAnimation) {
	if (animation === 'stars') {
		triggerStars();
	} else if (animation === 'money') {
		triggerMoney();
	}
}

export function findCheatCode(buffer: string[]): CheatCode | undefined {
	for (const cheat of CHEAT_CODES) {
		if (cheat.sequence) {
			const sequenceLen = cheat.sequence.length;
			if (buffer.length >= sequenceLen) {
				const recent = buffer.slice(-sequenceLen);
				if (JSON.stringify(recent) === JSON.stringify(cheat.sequence)) {
					return cheat;
				}
			}
		} else if (cheat.code) {
			const codeLen = cheat.code.length;
			if (buffer.length >= codeLen) {
				const recent = buffer.slice(-codeLen).join('').toLowerCase();
				if (recent === cheat.code.toLowerCase()) {
					return cheat;
				}
			}
		}
	}
	return undefined;
}
