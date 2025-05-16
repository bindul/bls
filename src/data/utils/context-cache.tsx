/*
 * Copyright (c) 2025. Bindul Bhowmik
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {createContext, useContext} from "react";
import * as React from "react";

const DEFAULT_TTL = 1000 * 60 * 15; // 15 minutes

export type CacheEntry = {
    key: string;
    data: any;
    lastFetched: number;
    ttl: number;
}

export class Cache {
    cache: Map<string, CacheEntry> = new Map<string, CacheEntry>();

    // TODO Future: tiered cache and max entries
    get <T>(key: string) : T | null {
        const val = this.cache.get(key);
        if (val != null) {
            const now = Date.now();
            if (now < (val.lastFetched + val.ttl)) {
                return val.data;
            } else {
                // expired cache / remove
                this.cache.delete(key);
            }
        }
        return null;
    }

    put <T>(key: string, data: T, overrideTtl?: number) :T {
        const entry: CacheEntry = {
            key: key,
            data: data,
            lastFetched: Date.now(),
            ttl: overrideTtl || DEFAULT_TTL
        }
        const oldVal = this.cache.get(key);
        this.cache.set(key, entry);
        return oldVal?.data ?? entry.data;
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