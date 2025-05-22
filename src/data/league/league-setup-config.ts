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
import {DateConverter, DayOfWeekConverter, HHMMTimeConverter} from "../utils/json-utils";
import type {Moment} from "moment/moment";

export type OnlineScoringPlatform = "LeagueSecretary" | "LeaguePals" | "None"

@JsonObject("LeagueSecretaryInfo")
export class LeagueSecretaryInfo {
    @JsonProperty("center-id", Number)
    centerId: number = 0;

    @JsonProperty("center-dashboard-url", String)
    centerDashboardUrl: string | undefined = undefined;

    @JsonProperty("league-id", Number)
    leagueId: number = 0;

    @JsonProperty("league-dashboard-url", String)
    leagueDashboardUrl: string | undefined = undefined;
}

@JsonObject("OnlineScoring")
export class OnlineScoring {
    @JsonProperty("platform", String)
    platform: OnlineScoringPlatform = "None"

    @JsonProperty("league-secretary", LeagueSecretaryInfo)
    leagueSecretary: LeagueSecretaryInfo | undefined = undefined;
}

export type LeagueBowlingDurationUnit = "WK" | "MT" | "TW" | "FN"

@JsonObject("LeagueBowlingDays")
export class LeagueBowlingDays {

    @JsonProperty("games-per-week", Number)
    gamesPerWeek: number = 0;

    @JsonProperty("bowls-on", DayOfWeekConverter)
    bowlsOn: Moment | undefined = undefined;

    @JsonProperty("start-time", HHMMTimeConverter)
    startTime: Moment | undefined = undefined;

    @JsonProperty("start-date", DateConverter)
    startDate: Moment | undefined = undefined;

    @JsonProperty("duration", Number)
    duration: number = 0;

    @JsonProperty("duration-unit", String)
    durationUnit: LeagueBowlingDurationUnit = "WK"

    @JsonProperty("position-rounds", [String])
    positionRounds: string[] = [];
}

export type HandicapType = "NONE" | "PCT_AVG_TO_TGT";

@JsonObject("PercentOfAverageToTargetHandicapConfig")
export class PercentOfAverageToTargetHandicapConfig {

    @JsonProperty("pct-to-target", Number)
    pctToTarget: number = 0;

    @JsonProperty("target", Number)
    target: number = 0;
}

@JsonObject("LeagueHandicap")
export class LeagueHandicap {

    @JsonProperty("type", String)
    type: HandicapType = "NONE"

    @JsonProperty("pct-avg-to-tgt-config", PercentOfAverageToTargetHandicapConfig)
    pctAvgToTargetConfig?: PercentOfAverageToTargetHandicapConfig = undefined;

    // TODO Future - add info about USBC carry over handicap
    // TODO Future - add absent score / handicap
    // TODO Update League Summary page
}

export type VacantOrAbsentOpponentScoringType = "POINTS_WITHIN_AVG" | "FORFEIT";

@JsonObject("PointsWithinAverageVacantAbsentScoringConfig")
export class PointsWithinAverageVacantAbsentScoringConfig {

    @JsonProperty("points-within-team-avg", Number)
    pointsWithinTeamAverage: number = 0;
}

@JsonObject("VacantOrAbsentOpponentScoring")
export class VacantOrAbsentOpponentScoring {

    @JsonProperty("allowed", Boolean)
    allowed: boolean = false;

    @JsonProperty("type", String)
    scoringType?: VacantOrAbsentOpponentScoringType = "FORFEIT";

    @JsonProperty("points-within-avg-config", PointsWithinAverageVacantAbsentScoringConfig)
    pointsWithinAverageConfig?: PointsWithinAverageVacantAbsentScoringConfig = undefined;
}

export type MatchupPointScoringRule = "PPG_PPS";

@JsonObject("PpgPpsMatchupPointScoringConfig")
export class PpgPpsMatchupPointScoringConfig {

    @JsonProperty("points-per-game", Number)
    pointsPerGame: number = 1;

    @JsonProperty("points-per-series", Number)
    pointsPerSeries: number = 1;

    @JsonProperty("points-per-game-on-tie", Number)
    pointsPerGameOnTie: number = 0.5;

    @JsonProperty("points-per-series-on-tie", Number)
    pointsPerSeriesOnTie: number = 0.5;

    @JsonProperty("vacant-opponent-allowed", Boolean)
    vacantOpponentAllowed: boolean = false;

    @JsonProperty("absent-opponent-allowed", Boolean)
    absentOpponentAllowed: boolean = false;
}

@JsonObject("LeaguePointScoring")
export class LeaguePointScoring {

    @JsonProperty("matchup-point-scoring-rule", String)
    matchupPointScoringRule: MatchupPointScoringRule = "PPG_PPS";

    @JsonProperty("ppg-pps-matchup-point-scoring-config", PpgPpsMatchupPointScoringConfig)
    ppgPpsMatchupPointScoringConfig?: PpgPpsMatchupPointScoringConfig | undefined = undefined;

    @JsonProperty("vacant-opponent-scoring", VacantOrAbsentOpponentScoring)
    vacantOpponentScoring: VacantOrAbsentOpponentScoring | undefined = undefined;

    @JsonProperty("absent-opponent-scoring", VacantOrAbsentOpponentScoring)
    absentOpponentScoring: VacantOrAbsentOpponentScoring | undefined = undefined;
}

@JsonObject("LeagueBlindPenalty")
export class LeagueBlindPenalty {

    @JsonProperty("blinds-allowed", Boolean)
    allowed: boolean = false;

    @JsonProperty("default-penalty", Number)
    defaultPenalty: number = 0;

    @JsonProperty("missed-matchups-penalty", Number)
    missedMatchupsPenalty: number = 0;

    @JsonProperty("missed-matchups-threshold", Number)
    missedMatchupsThreshold: number = 0;
}

@JsonObject("LeagueScoringRules")
export class LeagueScoringRules {

    @JsonProperty("legal-min-lineup", Number)
    legalMinLineup: number = 0;

    @JsonProperty("lineup", Number)
    lineup: number = 0;

    @JsonProperty("roster", Number)
    roster: number = 0;

    @JsonProperty("substitutes-allowed", Boolean)
    subsAllowed: boolean = false;

    @JsonProperty("hdcp", LeagueHandicap)
    handicap: LeagueHandicap | undefined = undefined;

    @JsonProperty("blind-penalty", LeagueBlindPenalty)
    blindPenalty: LeagueBlindPenalty | undefined = undefined;

    @JsonProperty("point-scoring", LeaguePointScoring)
    pointScoring: LeaguePointScoring | undefined = undefined;
}