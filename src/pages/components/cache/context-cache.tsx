/*
 * Copyright (c) 2025. Bindul Bhowmik
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {createContext, useContext} from "react";
import * as React from "react";

const DEFAULT_TTL = 1000 * 60 * 15; // 15 minutes
const DEFAULT_MAX_CACHE_PER_CATEGORY = 2;
export const SINGLE_ENTRY_CATEGORY_KEY = "SINGLE_DEFAULT";

export type CacheEntry = {
    key: string;
    data: any;
    lastFetched: number;
    ttl: number;
}

export class Cache {
    cache: Map<string, Map<string, CacheEntry>> = new Map();

    get <T>(category: string, key: string = SINGLE_ENTRY_CATEGORY_KEY ) : T | null {
        const categoryCache = this.getCategoryCache(category, false);
        if (categoryCache) {
            return this.getEntryWithExpiryCheck(key, categoryCache)?.data ?? null;
        }
        return null;
    }

    put <T>(category: string, key: string = SINGLE_ENTRY_CATEGORY_KEY, data: T, overrideTtl?: number)  {
        const entry: CacheEntry = {
            key: key,
            data: data,
            lastFetched: Date.now(),
            ttl: overrideTtl || DEFAULT_TTL
        }

        const categoryCache = this.getCategoryCache(category, true);
        if (categoryCache != null) {
            const oldVal = this.getEntryWithExpiryCheck(key, categoryCache);
            if (oldVal == null && categoryCache.size >= DEFAULT_MAX_CACHE_PER_CATEGORY) {
                // We will be adding to the cache (not replacing)
                this.removeOldestEntry(categoryCache);
            }
            categoryCache.set(key, entry);
        }
    }

    async clear() {
        this.cache.clear();
    }

    private getCategoryCache(category: string, createIfMissing: boolean) {
        let categoryCache = this.cache.get(category);
        if (!categoryCache && createIfMissing) {
            categoryCache = new Map<string, CacheEntry>();
            this.cache.set(category, categoryCache);
        }
        return categoryCache;
    }

    private getEntryWithExpiryCheck (key: string, categoryCache: Map<string, CacheEntry>) {
        const val = categoryCache.get(key);
        if (val != null) {
            const now = Date.now();
            if (now < (val.lastFetched + val.ttl)) {
                return val;
            } else {
                // expired cache / remove
                categoryCache.delete(key);
            }
        }
        return null;
    }

    private removeOldestEntry (categoryCache: Map<string, CacheEntry>) {
        let oldestKey = null;
        let oldestEntryTime: number = Number.MAX_SAFE_INTEGER;
        for (let [key, value] of categoryCache) {
            if (oldestKey == null) {
                oldestKey = key;
                oldestEntryTime = value.lastFetched;
            } else if (value.lastFetched < oldestEntryTime) {
                oldestEntryTime = value.lastFetched;
                oldestKey = key;
            }
        }
        if (oldestKey != null) {
            categoryCache.delete(oldestKey);
        }
    }
}

const ContextCache = createContext<Cache | undefined>(undefined);

interface ContextCacheProviderParams {
    children?: React.ReactNode;
}
export const ContextCacheProvider: React.FC<ContextCacheProviderParams> = ({children} :ContextCacheProviderParams) => {
    const cache = new Cache();
    return  (
        <ContextCache.Provider value={cache}>
            {children}
        </ContextCache.Provider>
    );
}

export const useContextCache = () => {
    return useContext(ContextCache);
}