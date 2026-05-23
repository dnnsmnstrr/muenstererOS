type CacheEntry<T> = {
	value: T;
	expiry: number;
};

class MemoryCache {
	private cache: Map<string, CacheEntry<any>> = new Map();

	set<T>(key: string, value: T, ttlSeconds: number): void {
		const expiry = Date.now() + ttlSeconds * 1000;
		this.cache.set(key, { value, expiry });
	}

	get<T>(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() > entry.expiry) {
			this.cache.delete(key);
			return null;
		}

		return entry.value as T;
	}

	delete(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}
}

export const gistCache = new MemoryCache();
