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
import type {Moment} from "moment";
import {DateConverter} from "../utils/json-utils.ts";

@JsonObject("GameScore")
export class GameScore {

    @JsonProperty("scratch-score", Number)
    scratchScore: number = 0;

    /**
     * Scratch score including blinds, absent and vacant teams
     */
    effectiveScratchScore: number = 0;

    @JsonProperty("hdcp", Number)
    hdcp: number = 0;

    @JsonProperty("hdcp-score", Number)
    hdcpScore: number = 0;
}

export class SeriesScore extends GameScore {
    average: number = 0;
    games: number = 0;
    pointsWon : number = 0;
}

@JsonObject("MatchupGameScore")
export class MatchupGameScore extends GameScore {
    pointsWon : number = 0;
}

export type ScoreLabel = "X" | "/" | "S" | "F" | "-";
export type FrameAttributes = "Hung" | "Star" | "Turkey" | "Perfect-Game" | "Gutter-Spare" | "Split-Picked-Up";
export class Frame {
    number: number = 0;
    ballScores: [number, ScoreLabel?][] = [];
    cumulativeScore: number = 0;
    attributes: FrameAttributes[] = [];
}

@JsonObject("TeamPlayerGameScore")
export class TeamPlayerGameScore extends GameScore {

    @JsonProperty("blind", Boolean)
    blind: boolean = false;

    @JsonProperty("arsenal", [String])
    arsenal: string[] = [];

    @JsonProperty("frames", [[String]])
    inFrames: (string[])[] = [];

    frames: Frame[] = [];
}

@JsonObject("LeagueTeamPlayerScore")
export class LeagueTeamPlayerScore {

    @JsonProperty("player", String)
    player: string | undefined = undefined;

    @JsonProperty("entering-average", Number)
    enteringAverage: number = 0;

    enteringHdcp: number = 0;
    average: number = 0;

    @JsonProperty("hdcp-setting-day", Boolean)
    hdcpSettingDay?: boolean = false;

    @JsonProperty("games", [TeamPlayerGameScore])
    games: TeamPlayerGameScore[] = [];

    series: SeriesScore = new SeriesScore()
}

@JsonObject("TeamScore")
export abstract class TeamScore {
    @JsonProperty("games", [MatchupGameScore])
    games: MatchupGameScore[] = [];

    series: SeriesScore = new SeriesScore();
}

@JsonObject("LeagueTeamScore")
export class LeagueTeamScore extends TeamScore {

    @JsonProperty("player-scores", [LeagueTeamPlayerScore])
    playerScores: LeagueTeamPlayerScore[] = [];
}

@JsonObject("OpponentTeamScore")
export class OpponentTeamScore  extends TeamScore {
}

@JsonObject("OpponentTeam")
export class OpponentTeam {

    @JsonProperty("team-id", String)
    teamId: string | undefined = undefined;

    @JsonProperty("entering-rank", Number)
    enteringRank: number = 0;

    @JsonProperty("players", [String])
    playersBowled: string[] = [];

    @JsonProperty("hdcp", Number)
    teamHdcp: number = 0;

    @JsonProperty("vacant", Boolean)
    vacant: boolean = false;

    @JsonProperty("absent", Boolean)
    absent: boolean = false;

    @JsonProperty("pre-post-bowl", Boolean)
    prePostBowl: boolean = false;

    @JsonProperty("scores", OpponentTeamScore)
    scores: OpponentTeamScore | undefined = undefined;
}

export type MatchupType = "REGULAR-DIVISION" | "REGULAR-INTER-DIVISION" | "POSITION-INTRA-DIVISION" | "POSITION-INTER-DIVISION" | "POSITION" | "FUN" | "OTHERS";
export type OilPattern = "HOUSE-SHOT-FRESH" | "HOUSE-SHOT-2ND-LEAGUE" | "BURNT-NO-OIL" | "SPORT-PATTERN" | "UNKNOWN";

@JsonObject("LeagueMatchup")
export class LeagueMatchup {

    @JsonProperty("week", Number)
    week :number = 0;

    @JsonProperty("scheduled-date", DateConverter)
    scheduledDate :Moment | undefined = undefined;

    @JsonProperty("bowl-date", DateConverter)
    bowlDate :Moment | undefined = undefined;

    @JsonProperty("matchup-type", String)
    matchup :MatchupType = "OTHERS";

    @JsonProperty("entering-rank", Number)
    enteringRank :number = 0;

    @JsonProperty("lanes", [Number])
    lanes :number[] = [];

    @JsonProperty("oil-pattern", String)
    oilPattern? :OilPattern = undefined;

    @JsonProperty("notes", [String])
    notes :string[] = [];

    @JsonProperty("scores", LeagueTeamScore)
    scores: LeagueTeamScore | undefined = undefined;

    @JsonProperty("opponent", OpponentTeam)
    opponent: OpponentTeam | undefined = undefined;

    pointsWonLost: number[] = new Array(2);
}
