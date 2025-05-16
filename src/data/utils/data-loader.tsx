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

import {useEffect, useState} from "react";
import {useContextCache} from "./context-cache";

export interface CachedFetcherReturn<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}

export function useCachedFetcher<T>(key :string, fetcher :() => Promise<T>): CachedFetcherReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const contextCache = useContextCache();

    useEffect(() => {

        // Check cache
        if (contextCache != null) {
            let value = contextCache.get<T>(key);
            if (value != null) {
                // console.debug("Returning cached value: ", JSON.stringify(value));
                setData(value);
                setLoading(false);
                return;
            }
        }

        fetcher().then((data) => {
            // console.debug("Retrieved value: ", JSON.stringify(data));
            if (contextCache != null) {
                contextCache.put<T>(key, data);
            }
            setData(data);
        })
            .catch(error => {
                console.error(error);
                setError(error);})
            .finally(() => setLoading(false));
    }, []);

    return {data, isLoading, error};
}