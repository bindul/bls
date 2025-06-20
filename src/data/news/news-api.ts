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

import {createJsonConverter} from "../utils/json-utils";
import {News} from "./news-items";

export const NEWS_CACHE_CATEGORY = "news";
const NEWS_RESOURCE = import.meta.env.VITE_DATA_NEWS_INDEX_RESOURCE;

export const newsFetcher = async() =>
    fetch(NEWS_RESOURCE)
        .then(res => res.json())
        .then((json :object) => createJsonConverter().deserialize<News>(json, News) as unknown as News);