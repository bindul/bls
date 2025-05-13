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

import {fetchResource} from "../utils/query-client";
import {Players} from "./player-info";

const PLAYER_INDEX_RESOURCE = "players.json";

export async function getPlayerInfos() {
    // TODO Add context and caching support. See league-api.ts for sample
    return fetchResource(PLAYER_INDEX_RESOURCE, json => new Players(json));
}