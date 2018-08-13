import {Injectable} from "@typeix/rexxar";
/**
 * Asset loader service
 * @constructor
 * @function
 * @name Assets
 *
 * @description
 * Load assets from disk
 */
@Injectable()
export class InMemoryCache {

    private _cache: Map<string, string> = new Map();
    private _timers: Map<string, NodeJS.Timer> = new Map();

    /**
     * Clear cache
     */
    clear(): void {
        this._timers.forEach(timer => clearTimeout(timer));
        this._timers.clear();
        this._cache.clear();
    }

    /**
     * Delete cache by key
     * @param key
     * @returns {boolean}
     */
    delete(key: string): boolean {
        if (this._timers.has(key)) {
            clearTimeout(this._timers.get(key));
            this._timers.delete(key);
        }
        return this._cache.delete(key);
    }


    /**
     * Get cache by key
     * @param key
     * @returns {boolean}
     */
    get(key: string): string | undefined {
        return this._cache.get(key);
    }

    /**
     * Check if cache key is there
     * @param key
     * @returns {boolean}
     */
    has(key: string): boolean {
        return this._cache.has(key);
    }

    /**
     * Set value in chache
     * @param key
     * @param value
     * @param timeoutInSec
     * @returns {InMemoryCache}
     */
    set(key: string, value: string, timeoutInSec: number = 0): this {
        if (timeoutInSec > 0) {
            this._timers.set(key, setTimeout(() => this.delete(key), 1000 * timeoutInSec));
        }
        this._cache.set(key, value);
        return this;
    }

}
