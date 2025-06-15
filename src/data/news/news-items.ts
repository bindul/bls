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

import {JsonObject, JsonProperty} from "json2typescript";
import moment, {type Moment} from "moment";
import {DateConverter} from "../utils/json-utils";

@JsonObject("NewsItem")
export class NewsItem {

    @JsonProperty("date", DateConverter)
    date :Moment = moment();

    @JsonProperty("title", String)
    title: string | undefined = undefined;

    @JsonProperty("text", String)
    text: string | undefined = undefined;
}

@JsonObject("News")
export class News {

    @JsonProperty("items", [NewsItem])
    newsItems: NewsItem[] = [];
}