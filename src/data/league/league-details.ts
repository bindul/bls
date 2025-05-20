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

    // teams: TrackedTeam[];
    // otherTeams: OtherTeam[];
    //
    // honorRoll: Map<HonorType, HonorRoll> = new Map();

    // constructor(data: any) {
    //     this.id = data.id;
    //     this.name = data.name;
    //     this.season = data.season;
    //     this.center = data.center;
    //     // this.leagueSecretaryId = data['league-secreary-id'];
    //     this.usbcSanctioned = data['usbc-sanctioned'];
    //     this.completed = data.completed;
    //
    //     // this.config = new LeagueConfig(data.config);
    //     // this.teams = data["teams"].map((t :any) => new TrackedTeam(t));
    //     // this.otherTeams = data['other-teams']?.map((t: any) => new OtherTeam(t)) ?? [];
    // }

    // computeLeagueStats () :void {
    //     // Set Handicaps where required & Calcualate Points
    //     this.teams.forEach((t:TrackedTeam) => {
    //         t.matchups.forEach((m:Matchup) => {
    //             m.checkAndSetHandicap(this.config.handicapCalculator);
    //             m.assignPoints(this.config.pointsCalculator);
    //         })});
    //
    //     // Calculate Player Stats
    //     this.teams.forEach((t:TrackedTeam) => {
    //         this.computePlayerStats(t);
    //         this.computeHonorRoll(t);
    //     });
    // }
    //
    // private computePlayerStats (team :TrackedTeam):void {
    //     team.players.forEach((p :LeaguePlayer) => {
    //         let games: number[][] = [];
    //         let allGames :number[] = [];
    //         let series: number[] = [];
    //         team.matchups.forEach((m: Matchup) => {
    //             m.scores.playerScores.filter(s => (s.player == p.id && !s.games[0].blind)).forEach(s => {
    //                 // Games should have been calculated by now!
    //                 let seriesAccum: number = 0;
    //                 for (let i = 0; i < s.games.length; i++) {
    //                     if (games.length < i + 1) {
    //                         games.push([]);
    //                     }
    //                     let score = s.games[i].score;
    //                     seriesAccum += score;
    //                     games[i].push(score);
    //                     allGames.push(score);
    //                 }
    //                 series.push(seriesAccum);
    //             })
    //         });
    //
    //         // Compute Stats
    //         p.stats.series = new StatCollection(series);
    //         p.stats.games = new StatCollection(allGames);
    //         p.stats.statByGameInSeries = games.map(ig => new StatCollection(ig));
    //         p.stats.handicap = this.config.handicapCalculator.calculateHandicap1(p.stats.games.total, p.stats.games.count);
    //     });
    // }
    //
    // private computeHonorRoll(team :TrackedTeam):void {
    //     let isg = new HonorRoll("IND-Scratch_Game");
    //     let iss = new HonorRoll("IND-Scratch_Series");
    //     let tsg = new HonorRoll("TEAM-Scratch_Game");
    //     let tss = new HonorRoll("TEAM-Scratch_Series");
    //
    //     team.matchups.forEach((m:Matchup) => {
    //         if (m.scores.total.score > tss.value) {
    //             tss.setValues(m.scores.total.score, team.id, m.bowlDate);
    //         }
    //
    //         m.scores.games.forEach((g:MatchUpScore) => {
    //             if (g.score > tsg.value) {
    //                 tsg.setValues(g.score, team.id, m.bowlDate);
    //             }
    //         })
    //
    //         m.scores.playerScores.filter((s:Series) => !s.games[0].blind).forEach((s:Series) => {
    //             if (s.score > iss.value) {
    //                 iss.setValues(s.score, s.player, m.bowlDate);
    //             }
    //             s.games.forEach((g:Game) => {
    //                 if (g.score > isg.value) {
    //                     isg.setValues(g.score, s.player, m.bowlDate);
    //                 }
    //             })
    //         })
    //     });
    //
    //     this.honorRoll.set("IND-Scratch_Game", isg);
    //     this.honorRoll.set("IND-Scratch_Series", iss);
    //     this.honorRoll.set("TEAM-Scratch_Game", tsg);
    //     this.honorRoll.set("TEAM-Scratch_Series", tss);
    // }
}