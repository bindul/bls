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

import {PlayerInfo, Players} from "./player-info";
import {APP_URL_BASE} from "../utils/constants";
import {createJsonConverter} from "../utils/json-utils";
import moment from "moment";
import {compareMoments} from "../utils/utils.ts";

export const PLAYER_LIST_CACHE_CATEGORY = "player-list";
const PLAYER_INDEX_RESOURCE = "players.json";

function postProcessLoadedPlayers(players : Players) : Players {
    if (players != null) {
        // Set default last bowled dates for every player
        players.players?.forEach(player => {
            if (player.lastBowled == null) {
                player.lastBowled = moment();
            }
        })
        // Sort by last bowled and then by initials
        players.players?.sort((a:PlayerInfo, b:PlayerInfo) => {
            let lbd = compareMoments(a.lastBowled, b.lastBowled);
            return lbd != 0 ? lbd : a.id.localeCompare(b.id);
        });
    }
    return players;
}

export const playerListFetcher = async() =>
    fetch(APP_URL_BASE + PLAYER_INDEX_RESOURCE)
        .then(res => res.json())
        .then(json => createJsonConverter().deserializeObject<Players>(json, Players)) // The method is deprecated, but deserialize returns an array which we don't want
        .then(p => postProcessLoadedPlayers(p));
