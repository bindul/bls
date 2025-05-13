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

export const APP_URL_BASE = "/data/";

export interface Transform<T> {
    (json: any): T;
}

export async function fetchResource <T>(resource: string, transform: Transform<T>): Promise<T> {
    const url = APP_URL_BASE + resource;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch resource: ${resource} :: ${response.status}`);
    }
    const json = await response.json();
    console.debug("Fetched from ", url, ": ", json);
    return transform(json);
}
