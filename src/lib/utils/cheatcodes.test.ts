import { describe, it, expect } from 'vitest';
import { CHEAT_CODES, findCheatCode } from './cheatcodes';

describe('cheatcodes', () => {
	it('should have a konami code sequence', () => {
		const konami = CHEAT_CODES.find((c) => c.id === 'konami');
		expect(konami).toBeDefined();
		expect(konami?.sequence).toBeInstanceOf(Array);
		expect(konami?.sequence?.length).toBeGreaterThan(0);
	});

	it('should have string-based cheat codes', () => {
		const motherlode = CHEAT_CODES.find((c) => c.id === 'motherlode');
		expect(motherlode).toBeDefined();
		expect(motherlode?.code).toBe('motherlode');
		expect(motherlode?.animation).toBe('money');
	});

	it('should have hesoyam code', () => {
		const hesoyam = CHEAT_CODES.find((c) => c.id === 'hesoyam');
		expect(hesoyam).toBeDefined();
		expect(hesoyam?.code).toBe('hesoyam');
		expect(hesoyam?.animation).toBe('money');
	});

	describe('findCheatCode', () => {
		it('should find konami code in sequence', () => {
			const buffer = [
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
			];
			const cheat = findCheatCode(buffer);
			expect(cheat?.id).toBe('konami');
		});

		it('should find motherlode in buffer', () => {
			const buffer = ['m', 'o', 't', 'h', 'e', 'r', 'l', 'o', 'd', 'e'];
			const cheat = findCheatCode(buffer);
			expect(cheat?.id).toBe('motherlode');
		});

		it('should find cheat code with extra characters at the beginning', () => {
			const buffer = ['x', 'y', 'z', 'm', 'o', 't', 'h', 'e', 'r', 'l', 'o', 'd', 'e'];
			const cheat = findCheatCode(buffer);
			expect(cheat?.id).toBe('motherlode');
		});

		it('should return undefined for no match', () => {
			const buffer = ['a', 'b', 'c'];
			const cheat = findCheatCode(buffer);
			expect(cheat).toBeUndefined();
		});
	});
});
