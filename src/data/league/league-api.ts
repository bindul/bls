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

import {LeagueDetails} from "./league-details";
import {AvailableLeagues} from "./league-info";
import {createJsonConverter} from "../utils/json-utils";
import {decorateLeagueDetails} from "./league-calculators";

export const LEAGUE_LIST_CACHE_CATEGORY = "league-list";
export const LEAGUE_DETAILS_CACHE_CATEGORY = "league-details";

const APP_URL_BASE = import.meta.env.VITE_DATA_URL_BASE;
const LEAGUE_INDEX_RESOURCE = import.meta.env.VITE_DATA_LEAGUES_INDEX_RESOURCE;

export const leagueInfoListFetcher = async() =>
    fetch(APP_URL_BASE + LEAGUE_INDEX_RESOURCE)
        .then(res => res.json())
        .then(json => createJsonConverter().deserializeObject<AvailableLeagues>(json, AvailableLeagues)); // The method is deprecated, but deserialize returns an array which we don't want

export const leagueTeamDetailsFetcher = async(dataLoc: string | undefined) =>
    fetch(APP_URL_BASE + dataLoc, {headers: {'Accept-Encoding': 'gzip'}})
        .then(res => res.json())
        .then(json => createJsonConverter().deserializeObject<LeagueDetails>(json, LeagueDetails))
        .then(leagueDetails => decorateLeagueDetails(leagueDetails));