export function isLetter(char: string): boolean {
	return /^[a-zA-Z]$/.test(char);
}

export function camelToPascal(str: string): string {
	if (!str) return '';
	return str[0].toUpperCase() + str.slice(1);
}
