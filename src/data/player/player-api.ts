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

import {Players} from "./player-info";
import {APP_URL_BASE} from "../utils/constants";
import {createJsonConverter} from "../utils/json-utils";

export const PLAYER_LIST_CACHE_CATEGORY = "player-list";
const PLAYER_INDEX_RESOURCE = "players.json";

function postProcessLoadedPlayers(players : Players) : Players {
    if (players != null) {
        // Set default last bowled dates for every player
        players.players?.forEach(player => {
            if (player.lastBowled == null) {
                const d = new Date();
                d.setUTCHours(0, 0, 0, 0);
                player.lastBowled = d;
            }
        })
        // Sort by last bowled and then by initials
        players.players?.sort((a:any, b:any) => (a.lastBowled !== b.lastBowled) ? b.lastBowled.getTime() - a.lastBowled.getTime() : a.id.localeCompare(b.id));
    }
    return players;
}

export const playerListFetcher = async() =>
    fetch(APP_URL_BASE + PLAYER_INDEX_RESOURCE)
        .then(res => res.json())
        .then(json => createJsonConverter().deserializeObject<Players>(json, Players)) // The method is deprecated, but deserialize returns an array which we don't want
        .then(p => postProcessLoadedPlayers(p));
