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

import {JsonObject, JsonProperty} from "json2typescript";
import {DateConverter} from "../utils/json-utils";
import type {Moment} from "moment";

@JsonObject("PlayerInfo")
export class PlayerInfo {

    @JsonProperty("id", String)
    id: string = "";

    @JsonProperty("name", String)
    name: string | undefined = undefined;

    @JsonProperty("last-bowled", DateConverter)
    lastBowled?: Moment | undefined = undefined;

    @JsonProperty("data-loc", String)
    dataLoc?: string = undefined;
}

@JsonObject("Players")
export class Players {

    @JsonProperty("players", [PlayerInfo])
    players: PlayerInfo[] = [];

}