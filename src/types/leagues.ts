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

import {
    type PointsCalculator,
    type HandicapCalculator,
    DefaultHandicapCalculator,
    OnePerGameOneTotalSplitTieVacantThresholdAbsentVacantPointsCalculator, Matchup,
    OpponentScores,
    TeamScores, MatchUpScore
} from "./league-scores.ts";
import {type Game, Series} from "./scores.ts";

/*
  {
    "games-per-week": 3,
    "hdcp": {
      "rule": "DEFAULT",
      "target": 210,
      "pct-to-target": 90.0
    },
    "point-assignment-rules": "1-per-game-1-total-split-tie-vacant-threshold-absent-vacant",
    "vacant-point-win-threshold": -40,
    "blind-penalty": {
      "default": 0,
      "missed-games-threshold": 3,
      "missed-games-penalty": 10
    }
  }
 */
export class LeagueConfig {
    gamesPerWeek: number;
    hdcpRule: string;
    hdcpTarget: number;
    hdcpPctToTarget: number;
    pointAssignmentRules: string;
    vacantPointWinThreshold: number;
    blindPenaltyDefault: number;
    blindPenaltyMissedGameTriggerThreshold: number;
    blindPenaltyMissedGamesPenalty: number;

    pointsCalculator: PointsCalculator;
    handicapCalculator: HandicapCalculator;

    constructor(data: any) {
        this.gamesPerWeek = data['games-per-week'];
        if (null != data.hdcp) {
            this.hdcpRule = data.hdcp.rule;
            this.hdcpTarget = data.hdcp.target;
            this.hdcpPctToTarget = data.hdcp['pct-to-target'];
        } else {
            this.hdcpRule = "";
            this.hdcpTarget = 0;
            this.hdcpPctToTarget = 0;
        }

        this.pointAssignmentRules = data["point-assignment-rules"];
        this.vacantPointWinThreshold = data["vacant-point-win-threshold"] ?? 0;

        this.blindPenaltyDefault = data["blind-penalty"]["default"] ?? 0;
        this.blindPenaltyMissedGameTriggerThreshold = data["blind-penalty"]["missed-games-threshold"] ?? 0;
        this.blindPenaltyMissedGamesPenalty = data["blind-penalty"]["missed-games-penalty"] ?? 0;

        // Setup factories
        if (this.hdcpRule == "DEFAULT") {
            this.handicapCalculator = new DefaultHandicapCalculator(this.hdcpTarget, this.hdcpPctToTarget / 100);
        } else {
            console.log("Unknown handicap rule, no handicap calculator available: ", this.hdcpRule);
            this.handicapCalculator = new NoOpCalculator();
        }
        if (this.pointAssignmentRules == "1-per-game-1-total-split-tie-vacant-threshold-absent-vacant") {
            this.pointsCalculator = new OnePerGameOneTotalSplitTieVacantThresholdAbsentVacantPointsCalculator(this.vacantPointWinThreshold);
        } else {
            console.log("Unknown point-assignment-rules: ", this.pointAssignmentRules);
            this.pointsCalculator = new NoOpCalculator();
        }
    }
}

class NoOpCalculator implements PointsCalculator, HandicapCalculator {
    calculateHandicap1(_pinfall: number, _games: number): number {
        throw new Error("Method not implemented.");
    }
    assignPoints(_team: TeamScores, _opponent: OpponentScores): void {
        throw new Error("Method not implemented.");
    }
    calculateHandicap(_enteringAverage: number, _games: Game[], _carryOverPins?: number, _carryOverGames?: number): number {
        throw new Error("Method not implemented.");
    }
}

export type HonorType = "IND-Scratch_Game" | "IND-Scratch_Series" | "TEAM-Scratch_Game" | "TEAM-Scratch_Series";
export class HonorRoll {
    type: HonorType;
    entity?: string;
    value: number = 0;
    date?: Date;

    constructor(type :HonorType) {
        this.type = type;
    }

    setValues (value: number, entity?: string, date?: Date): void {
        this.value = value;
        this.date = date;
        this.entity = entity;
    }
}

/*
      "id": "2425-summer-beer-38",
      "name": "Pins Go Boom!",
      "number": 38,
      "division": 2,
 */
export abstract class TeamInfo {
    id: string;
    number: number;
    name: string;
    division: string;

    constructor(data: any) {
        this.id = data.id;
        this.number = data.number;
        this.name = data.name;
        this.division = data.division;
    }
}

/*
    {
      "id": "2425-summer-beer-37",
      "number": 37,
      "division": "2",
      "name": "Team 37",
      "players": ["Ethan Mosier", "Eric Mosier", "Hillary Hanson", "Tim Hanson"]
    }
 */
export class OtherTeam extends TeamInfo {
    players: string[];

    constructor(data :any) {
        super(data);
        this.players = data.players;
    }
}

export type LeaguePlayerStatus = "REGULAR" | "SUBSTITUTE";
export interface CarryOverStats {
    pins: number;
    games: number;
}

export class StatCollection {
    average :number;
    min :number;
    max :number;
    stdDeviation :number;
    total :number;
    count :number;

    constructor (values :number[]) {
        this.count = values.length;
        this.total = values.reduce((a, b) => a + b, 0);
        this.average = this.total / this.count;
        this.min = Math.min(...values);
        this.max = Math.max(...values);
        this.stdDeviation = Math.sqrt(values.map(x => Math.pow(x - this.average, 2)).reduce((a, b) => a + b, 0) / this.count);
    }
}

export class LeaguePlayerStats {
    games? :StatCollection;
    series? :StatCollection
    statByGameInSeries? :StatCollection[];
    handicap?: number;
}

export class LeaguePlayer {
    id :string;
    name :string;
    status :LeaguePlayerStatus;
    carryOverStats ?:CarryOverStats;
    stats :LeaguePlayerStats;

    constructor(data :any) {
        this.id = data.id;
        this.name = data.name;
        this.status = data.status;
        this.carryOverStats  = data.carryOverStats;

        this.stats = new LeaguePlayerStats();
    }
}

export class TrackedTeam extends TeamInfo {
    position :number;
    players :LeaguePlayer[];
    matchups :Matchup[];

    constructor(data :any) {
        super(data);
        this.position = data.position;

        this.players = data.roster.map((p :any) => new LeaguePlayer(p));
        this.matchups = data.matchups.map((m :any) => new Matchup(m));
    }
}

/*
    {
      "id": "2425-summer-beer",
      "season": "2024-25",
      "center": "Arapahoe Bowling Center",
      "name": "Summer Thursday Beer League",
      "usbc-sanctioned": false,
      "completed": false,
      "config": // LeagueConfig,
        "honorRoll": // Calculated
        "teams": [
            {
                // Details
            }
        ],
        "other-teams":
      }
  }
 */
export class League {
    id: string;
    name: string;
    season: string;
    center: string;
    usbcSanctioned: boolean;
    leagueSecretaryId: string;
    completed: boolean;

    config: LeagueConfig;

    teams: TrackedTeam[];
    otherTeams: OtherTeam[];

    honorRoll: Map<HonorType, HonorRoll> = new Map();

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.season = data.season;
        this.center = data.center;
        this.leagueSecretaryId = data['league-secreary-id'];
        this.usbcSanctioned = data['usbc-sanctioned'];
        this.completed = data.completed;

        this.config = new LeagueConfig(data.config);
        this.teams = data["teams"].map((t :any) => new TrackedTeam(t));
        this.otherTeams = data['other-teams']?.map((t: any) => new OtherTeam(t)) ?? [];
    }

    computeLeagueStats () :void {
        // Set Handicaps where required & Calcualate Points
        this.teams.forEach((t:TrackedTeam) => {
            t.matchups.forEach((m:Matchup) => {
                m.checkAndSetHandicap(this.config.handicapCalculator);
                m.assignPoints(this.config.pointsCalculator);
            })});

        // Calculate Player Stats
        this.teams.forEach((t:TrackedTeam) => {
            this.computePlayerStats(t);
            this.computeHonorRoll(t);
        });
    }

    private computePlayerStats (team :TrackedTeam):void {
        team.players.forEach((p :LeaguePlayer) => {
            let games: number[][] = [];
            let allGames :number[] = [];
            let series: number[] = [];
            team.matchups.forEach((m: Matchup) => {
                m.scores.playerScores.filter(s => (s.player == p.id && !s.games[0].blind)).forEach(s => {
                    // Games should have been calculated by now!
                    let seriesAccum: number = 0;
                    for (let i = 0; i < s.games.length; i++) {
                        if (games.length < i + 1) {
                            games.push([]);
                        }
                        let score = s.games[i].score;
                        seriesAccum += score;
                        games[i].push(score);
                        allGames.push(score);
                    }
                    series.push(seriesAccum);
                })
            });

            // Compute Stats
            p.stats.series = new StatCollection(series);
            p.stats.games = new StatCollection(allGames);
            p.stats.statByGameInSeries = games.map(ig => new StatCollection(ig));
            p.stats.handicap = this.config.handicapCalculator.calculateHandicap1(p.stats.games.total, p.stats.games.count);
        });
    }

    private computeHonorRoll(team :TrackedTeam):void {
        let isg = new HonorRoll("IND-Scratch_Game");
        let iss = new HonorRoll("IND-Scratch_Series");
        let tsg = new HonorRoll("TEAM-Scratch_Game");
        let tss = new HonorRoll("TEAM-Scratch_Series");

        team.matchups.forEach((m:Matchup) => {
            if (m.scores.total.score > tss.value) {
                tss.setValues(m.scores.total.score, team.id, m.bowlDate);
            }

            m.scores.games.forEach((g:MatchUpScore) => {
                if (g.score > tsg.value) {
                    tsg.setValues(g.score, team.id, m.bowlDate);
                }
            })

            m.scores.playerScores.filter((s:Series) => !s.games[0].blind).forEach((s:Series) => {
                if (s.score > iss.value) {
                    iss.setValues(s.score, s.player, m.bowlDate);
                }
                s.games.forEach((g:Game) => {
                    if (g.score > isg.value) {
                        isg.setValues(g.score, s.player, m.bowlDate);
                    }
                })
            })
        });

        this.honorRoll.set("IND-Scratch_Game", isg);
        this.honorRoll.set("IND-Scratch_Series", iss);
        this.honorRoll.set("TEAM-Scratch_Game", tsg);
        this.honorRoll.set("TEAM-Scratch_Series", tss);
    }
}