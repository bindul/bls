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
import {LeagueMatchup} from "./league-matchup";
import {PlayerStats} from "../player/player-stats";
import type {LeagueAccolade} from "./league-details";

export class LeaguePlayerStats extends PlayerStats {
    handicap: number = 0;
    averageBoosterSeries: number = 0;
    bestGameOverAverage?: LeagueAccolade;
    bestSeriesOverAverage?: LeagueAccolade;
}

export class TeamStats {
    scratchPins: number = 0;
    average: number = 0;
    handicap: number = 0;
    highGame: number = 0;
    highSeries: number =0;
    lowGame: number = 0;
    lowSeries: number =0;
}

@JsonObject("LeagueTeam")
export abstract class LeagueTeam {
    @JsonProperty("id", String)
    id: string | undefined = undefined;

    @JsonProperty("number", Number)
    number: number = 0;

    @JsonProperty("division", String)
    division: string | undefined = undefined;

    @JsonProperty("name", String)
    name: string | undefined = undefined;
}

@JsonObject("OtherLeagueTeam")
export class OtherLeagueTeam extends LeagueTeam {

    @JsonProperty("players", [String])
    players?: string[] = [];
}

export type LeaguePlayerStatus = "REGULAR" | "SUBSTITUTE";

@JsonObject("LeaguePlayerCarryOverStats")
export class LeaguePlayerCarryOverStats {

    @JsonProperty("entering-hdcp", Number)
    enteringHdcp?: number = undefined;

    @JsonProperty("pins", Number)
    pins?: number = undefined;

    @JsonProperty("games", Number)
    games?: number = undefined;
}

@JsonObject("LeaguePlayer")
export class LeaguePlayer {

    @JsonProperty("id", String)
    id: string | undefined = undefined;

    @JsonProperty("name", String)
    name: string | undefined = undefined;

    @JsonProperty("status", String)
    status: LeaguePlayerStatus | undefined = undefined;

    @JsonProperty("parking-lot-threshold", Number)
    parkingLotThreshold: number = 100;

    @JsonProperty("carry-over-league-stats", LeaguePlayerCarryOverStats)
    carryOverStats?: LeaguePlayerCarryOverStats = undefined;

    playerStats?: LeaguePlayerStats = undefined;
}

@JsonObject("TrackedLeagueTeam")
export class TrackedLeagueTeam extends LeagueTeam {

    @JsonProperty("current-rank", String)
    currentRank: string = "";

    @JsonProperty("roster", [LeaguePlayer])
    roster: LeaguePlayer[] = [];

    @JsonProperty("matchups", [LeagueMatchup])
    matchups: LeagueMatchup[] = [];

    pointsWonLost: [number, number] = [0, 0];
    teamStats?: TeamStats = undefined;
}