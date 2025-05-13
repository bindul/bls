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

import {Game, type ScoreHolder} from './scores.ts';
import { Series } from './scores.ts';

/*
    {
      "score": 100,
      "hdcp-score": 120,
      "points": 1 // Optional
    }
 */
export class MatchUpScore implements ScoreHolder {
    hdcpScore: number;
    score: number;
    points?: number;

    // constructor()
    // constructor(hdcp?: number, data?: any)
    constructor(hdcp?: number, data?: any, hdcpMultiplier?: number) {
        this.score = data?.score ?? 0;
        this.hdcpScore = data?.['hdcp-score'] ?? 0;
        this.points = data?.points ?? 0;

        if (null == this.hdcpScore && null != this.score && hdcp != undefined) {
            let mult = hdcpMultiplier ?? 1;
            this.hdcpScore = this.score + (hdcp * mult);
        }
    }
}

/*
    {
      "total": {
        "score": 100,
        "hdcp-score": 120,
        "points": 1
      },
      "games": [{
        "score": 100,
        "hdcp-score": 120,
        "points": 1
      }]
    }
 */
export class MatchUpScores {
    total: MatchUpScore; // Always Calculated
    games: MatchUpScore[];

    constructor(data: any, hdcp?: number) {
        if (data.games != null && data.games.length > 0) {
            this.games = data.games.map((g: JSON) => new MatchUpScore(hdcp, g));
        } else {
            this.games = [];
        }
        this.total = this.computeTotalFromGames(hdcp);
    }

    protected computeTotalFromGames(hdcp?: number) {
        let total = new MatchUpScore();
        this.games.forEach((g: MatchUpScore) => {total.score += g.score});
        if (hdcp != undefined) {
            total.hdcpScore = total.score + (hdcp * this.games.length);
        }
        return total;
    }
}

/*
"opponent": {
    "team-id": "2425-summer-beer-37",
    "entering-rank": 0,
    "hdcp": 0,
    "vacant": false,
    "absent": false,
    "scores": {
      "total": {
        "score": 100,
        "hdcp-score": 120,
        "points": 1
      },
      "games": [{
        "score": 100,
        "hdcp-score": 120,
        "points": 1
      }]
    }
  }
 */
export class OpponentScores {
    teamId: string;
    enteringRank: number;
    hdcp: number;
    vacant?: boolean;
    absent?: boolean;
    scores: MatchUpScores;

    constructor (data: any) {
        this.teamId = data['team-id'];
        this.enteringRank = data['entering-rank'];
        this.hdcp = data['hdcp'];
        this.vacant = data['vacant'];
        this.absent = data['absent'];
        this.scores = new MatchUpScores(data['scores'], this.hdcp);
    }

}

/*
    "total": { // Optional
        "score": 100,
        "hdcp-score": 120,
        "points": 1
      },
      "games": [{ // Optional
        "score": 100,
        "hdcp-score": 120,
        "points": 1
      }],
      "player-scores": [
          {
          "player": "",
          "entering-average": 0,
          "hdcp": 0,
          "hdcp-setting-day": true,
          "score": 100, // Optional
          "hdcp-score": 120, // Optional
          "achievements": [
            ""
          ],
          "games": []
          }
        ]
    }
 */
export class TeamScores extends MatchUpScores {
    playerScores: Series[];

    constructor(data: any, teamHdcp?: number) {
        let ps: Series[] = [];
        if (null != data['player-scores']) {
            ps = data['player-scores'].map((ps: JSON) => new Series(ps)) as Series[];
        }
        let teamHdcpU = teamHdcp ?? ps.reduce((accum, series) => accum + series.hdcp, 0);
        super(data, teamHdcpU);
        this.playerScores = ps;

        if ((null == this.games || this.games.length == 0) && this.playerScores.length > 0 ) {
            // Compute the Games based on the Series
            this.calculateGamesAndTotal(teamHdcpU);
        }
    }

    calculateGamesAndTotal(teamHdcp?: number) {
        let teamHdcpU = teamHdcp ?? this.playerScores.reduce((accum, series) => accum + series.hdcp, 0);
        this.games = [];
        for (let i = 0; i < this.playerScores[0].games.length; i++) {
            let accum: number = 0;
            this.playerScores.forEach(s => accum += s.games[i].score);
            let g = new MatchUpScore();
            g.score = accum;
            g.hdcpScore = accum + teamHdcpU;
            this.games.push(g);
        }
        this.total = this.computeTotalFromGames(teamHdcpU);
    }
}

/*
  "week": 1,
  "scheduled-date": "2025-05-08",
  "bowl-date": "2025-05-08",
  "matchup-type": "REGULAR-DIVISION",
  "entering-rank": 0,
  "lanes": [37, 38],
  "oil-pattern": "House-Regular",
  "notes": [ "Start of League" ],
  "scores":
  "opponent":
 */
export class Matchup {
    week: number;
    scheduledDate: Date;
    bowlDate: Date;
    matchupType: string;
    enteringRank: number;
    lanes: number[];
    oilPattern: string;
    notes: string[];
    scores: TeamScores;
    opponent: OpponentScores;

    constructor(data: any) {
        this.week = data.week;
        this.scheduledDate = new Date(data['scheduled-date']);
        this.bowlDate = new Date(data['bowl-date']);
        this.matchupType = data['matchup-type'];
        this.enteringRank = data['entering-rank'];
        this.lanes = data['lanes'];
        this.oilPattern = data['oil-pattern'];
        this.notes = data['notes'];
        this.scores = new TeamScores(data['scores']);
        this.opponent = new OpponentScores(data['opponent']);
    }

    // TODO Assign Points
    // Setting Values and Calculations
    checkAndSetHandicap (hdcpCalc: HandicapCalculator): void {
        let hdcpChanged = false;
        this.scores.playerScores.forEach((series: Series) => {
            if (series.hdcpSettingDay) {
                hdcpChanged = true;
                series.hdcp = hdcpCalc.calculateHandicap(series.enteringAverage, series.games);
                series.calculateScores();
            }
        });
        if (hdcpChanged) {
            this.scores.calculateGamesAndTotal();
        }
    }

    assignPoints (pointsCalc: PointsCalculator) :void {
        pointsCalc.assignPoints(this.scores, this.opponent);
    }
}

export interface PointsCalculator {
    assignPoints (team: TeamScores, opponent: OpponentScores): void;
}

export interface HandicapCalculator {
    calculateHandicap (enteringAverage: number, games: Game[], carryOverPins?: number, carryOverGames?: number): number;
    calculateHandicap1 (pinfall: number, games: number): number;
}

/**
 * 1-per-game-1-total-split-tie-vacant-threshold-absent-vacant
 */
export class OnePerGameOneTotalSplitTieVacantThresholdAbsentVacantPointsCalculator implements PointsCalculator {
    vacantPointWinThreshold: number;

    constructor(vacantPointWinThreshold: number) {
        this.vacantPointWinThreshold = vacantPointWinThreshold;
    }

    assignPoints(team: TeamScores, opponent: OpponentScores) {
        let useThresholdScore = false;
        let thresholdScore = 0;
        if (opponent.vacant == true || opponent.absent == true) {
            // Calculate win threshold
            useThresholdScore = true;
            thresholdScore = team.playerScores.reduce((accum, ps) => accum + ps.enteringAverage + ps.hdcp, 0);
            thresholdScore += this.vacantPointWinThreshold;
        }

        // Games
        for (let i = 0; i < team.games.length; i++) {
            this.assignGamePoints(team.games[i], opponent.scores.games[i], useThresholdScore, thresholdScore);
        }
        // Total
        this.assignGamePoints(team.total, opponent.scores.total, useThresholdScore, thresholdScore * team.games.length);
    }

    private assignGamePoints (teamScore: MatchUpScore, opponentScore: MatchUpScore, useThresholdScore: boolean, thresholdScore: number) {
        let teamPins = teamScore.hdcpScore;
        if (useThresholdScore) {
            if (teamPins > thresholdScore) {
                teamScore.points = 1;
            } else {
                let opponentPins = opponentScore.hdcpScore;
                if (teamPins > opponentPins) {
                    teamScore.points = 1;
                } else if (teamPins == opponentPins) {
                    teamScore.points = 0.5;
                    opponentScore.hdcpScore = 0.5;
                } else {
                    opponentScore.hdcpScore = 1;
                }
            }
        }
    }
}

export class DefaultHandicapCalculator implements HandicapCalculator {
    targetPins: number;
    pctToTarget: number;

    constructor(targetPins: number, pctToTarget: number) {
        this.targetPins = targetPins;
        this.pctToTarget = pctToTarget;
    }

    calculateHandicap(_enteringAverage: number, games: Game[], _carryOverPins?: number, _carryOverGames?: number): number {
        let pinFall = games.reduce((accum, g) => accum + g.score, 0);
        // TODO Implement carryOver
        return this.calculateHandicap1(pinFall, games.length);
    }

    calculateHandicap1 (pinfall: number, games: number): number {
        let avg = pinfall / games;
        return (avg >= this.targetPins) ? 0 : Math.floor((this.targetPins - avg) * this.pctToTarget);
    }
}