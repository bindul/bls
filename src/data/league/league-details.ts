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
import {LeagueBowlingDays, LeagueScoringRules, OnlineScoring} from "./league-setup-config";
import {OtherLeagueTeam, TrackedLeagueTeam} from "./league-team-details";
import type {Moment} from "moment";

export type LeagueAccoladeType = "IND-SCRATCH-GAME" | "IND-SCRATCH-SERIES" | "TEAM-SCRATCH-GAME" | "TEAM-SCRATCH-SERIES" | "IND-HIGH-AVERAGE" | "IND-GAME-OVER-AVERAGE" | "IND-SERIES-OVER-AVERAGE";

export interface LeagueAccolade {
    type : LeagueAccoladeType;
    who: string;
    when: Moment | undefined;
    howMuch: number;
    description: string;
}

@JsonObject("LeagueDetails")
export class LeagueDetails {

    @JsonProperty("id", String)
    id: string | undefined = undefined;

    @JsonProperty("name", String)
    name: string | undefined = undefined;

    @JsonProperty("season", String)
    season: string | undefined = undefined;

    @JsonProperty("center", String)
    center: string | undefined = undefined;

    @JsonProperty("usbc-sanctioned", Boolean)
    usbcSanctioned: boolean = false;

    @JsonProperty("completed", Boolean)
    completed: boolean = false;

    @JsonProperty("online-scoring", [OnlineScoring])
    onlineScoring: OnlineScoring[] = [];

    @JsonProperty("bowling-days", LeagueBowlingDays)
    bowlingDays: LeagueBowlingDays | undefined = undefined;

    @JsonProperty("scoring-rules", LeagueScoringRules)
    scoringRules: LeagueScoringRules | undefined = undefined;

    @JsonProperty("teams", [TrackedLeagueTeam])
    teams: TrackedLeagueTeam[] = [];

    @JsonProperty("other-teams", [OtherLeagueTeam])
    otherTeams: OtherLeagueTeam[] = [];

    leagueAccolades: LeagueAccolade[] = [];
}