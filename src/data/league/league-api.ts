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

import {AvailableLeagues} from "./league-info.ts";
import {fetchResource} from "../utils/query-client.ts";
import type {LeagueListContextInfo} from "../../pages/components/league/league-list-context.tsx";

const LEAGUE_INDEX_RESOURCE = "leagues.json";
const LEAGUE_INDEX_CACHE_TTL = 5 * 60 * 1000; // 5 mins

export async function getAvailableLeagues(context?:LeagueListContextInfo) {
    if (context && context.leagues && context.lastUpdated && Date.now() - context.lastUpdated.getTime() < LEAGUE_INDEX_CACHE_TTL) {
        console.debug("Returning cached leagues");
        return context.leagues;
    }
    const avblLeaguesPromise = fetchResource(LEAGUE_INDEX_RESOURCE, json => new AvailableLeagues(json));
    if (context) {
        // Wrap the promise so we can cache the value
        return avblLeaguesPromise.then(v => {
            context.leagues = v;
            context.lastUpdated = new Date();
            return v;
        });
    }
    return avblLeaguesPromise;
}