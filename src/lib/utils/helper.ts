// string
export const capitalize = (string: string) => (string && string[0].toUpperCase() + string.slice(1)) || '';

export function disemvowel(str: string) {
	var strArr = str.split('');
	for (var x = 0; x < str.length; x++) {
		var char = str[x].toLowerCase();
		if (char == 'a' || char == 'e' || char == 'i' || char == 'o' || char == 'u') {
			strArr[x] = '';
		}
	}
	return strArr.join('');
}

// number
export const randomNumber = (min = 0, max = 100) => {
	return Math.round(Math.random() * (max - min)) + min;
};

// color
export function hexToHsl(hex: string): string {
	// Remove the hash character, if present
	hex = hex.replace(/^#/, '');

	// Parse the hex values to RGB
	let bigint = parseInt(hex, 16);
	let r = (bigint >> 16) & 255;
	let g = (bigint >> 8) & 255;
	let b = bigint & 255;

	// Normalize RGB values to the range [0, 1]
	let normalizedR = r / 255;
	let normalizedG = g / 255;
	let normalizedB = b / 255;

	// Find the maximum and minimum values among the RGB components
	let max = Math.max(normalizedR, normalizedG, normalizedB);
	let min = Math.min(normalizedR, normalizedG, normalizedB);

	// Calculate the lightness (L) value
	let lightness = (max + min) / 2;

	// Calculate the saturation (S) value
	let saturation = 0;
	if (max !== min) {
		saturation = lightness <= 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
	}

	// Calculate the hue (H) value
	let hue = 0;
	if (max === normalizedR) {
		hue = ((normalizedG - normalizedB) / (max - min) + 6) % 6;
	} else if (max === normalizedG) {
		hue = (normalizedB - normalizedR) / (max - min) + 2;
	} else if (max === normalizedB) {
		hue = (normalizedR - normalizedG) / (max - min) + 4;
	}

	// Convert hue to degrees
	hue *= 60;

	return `${Math.round(hue)} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`
}