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

import {type LeagueAccolade, LeagueDetails} from "./league-details";
import {
    Frame,
    type GameScore,
    LeagueMatchup,
    LeagueTeamPlayerScore,
    MatchupGameScore, SeriesScore,
    TeamPlayerGameScore, TeamScore
} from "./league-matchup";
import {LeagueScoringRules} from "./league-setup-config";
import {isNumeric} from "../utils/utils.ts";

// ---------------------------------------------------------------------------------------------------------------------
// Interfaces and Implementations
// ---------------------------------------------------------------------------------------------------------------------

interface HandicapCalculator {
    calculateAverge (games : GameScore[], carryOverPins?: number, carryOverGames?: number): number;
    calculateHandicap (average: number): number;
}

class ZeroHandicapCalculator implements HandicapCalculator {
    calculateHandicap(_average: number): number {
        return 0;
    }

    calculateAverge(games: GameScore[], carryOverPins?: number, carryOverGames?: number): number {
        let pinFall = games.reduce((accum, g) => accum + g.scratchScore, 0);
        let gameCount = games.length;
        if (carryOverPins && carryOverGames) {
            pinFall += carryOverPins;
            gameCount += carryOverGames;
        }
        return pinFall / gameCount;
    }
}

class PercentAverageToTargetHandicapCapculator extends ZeroHandicapCalculator implements HandicapCalculator {
    targetPins: number;
    pctToTarget: number;

    constructor(targetPins: number, pctToTarget: number) {
        super();
        this.targetPins = targetPins;
        this.pctToTarget = pctToTarget;
    }

    calculateHandicap(average: number): number {
        return (average >= this.targetPins) ? 0 : Math.floor((this.targetPins - average) * (this.pctToTarget / 100));
    }
}

interface PointsCalculator {
    assignPoints (teamScoreA: TeamScore, teamScoreB: TeamScore): void;
}

class PpgPpsPointsCalculator implements PointsCalculator {
    pointsOnGameWin: number;
    pointsOnSeriesWin: number;
    pointsOnGameTie: number;
    pointsOnSeriesTie: number;
    
    constructor(pointsOnGameWin: number, pointsOnGameTie: number, pointsOnSeriesWin: number, pointsOnSeriesTie: number) {
        this.pointsOnGameWin = pointsOnGameWin;
        this.pointsOnGameTie = pointsOnGameTie;
        this.pointsOnSeriesWin = pointsOnSeriesWin;
        this.pointsOnSeriesTie = pointsOnSeriesTie;
    }

    assignPoints(teamScoreA: TeamScore, teamScoreB: TeamScore) {
        teamScoreA.games.forEach((ga: MatchupGameScore, i: number) => {
            const gb = teamScoreB.games[i];
            if (ga.hdcpScore == gb.hdcpScore) {
                ga.pointsWon = this.pointsOnGameTie;
                gb.pointsWon = this.pointsOnGameTie;
            } else if (ga.hdcpScore > gb.hdcpScore) {
                ga.pointsWon = this.pointsOnGameWin;
            } else {
                gb.pointsWon = this.pointsOnGameWin;
            }
        });
        if (teamScoreA.series.hdcpScore == teamScoreB.series.hdcpScore) {
            teamScoreA.series.pointsWon = this.pointsOnSeriesTie;
            teamScoreB.series.pointsWon = this.pointsOnSeriesTie;
        } else if (teamScoreA.series.hdcpScore > teamScoreB.series.hdcpScore) {
            teamScoreA.series.pointsWon = this.pointsOnSeriesWin;
        } else {
            teamScoreB.series.pointsWon = this.pointsOnSeriesWin;
        }
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------------------------------------------------

function selectHandicapCalculator(leagueScoringRules: LeagueScoringRules | undefined) : HandicapCalculator {
    const type = leagueScoringRules?.handicap?.type;
    if (type) {
        if (type === "NONE") {
            return new ZeroHandicapCalculator();
        } else if (type === "PCT_AVG_TO_TGT" && leagueScoringRules?.handicap?.pctAvgToTargetConfig) {
            const config = leagueScoringRules?.handicap?.pctAvgToTargetConfig;
            return new PercentAverageToTargetHandicapCapculator(config.target, config.pctToTarget)
        }
    }
    console.debug("Missing or incorrect handicap calcualtor config, returning Zero Handicap Calculator", leagueScoringRules?.handicap);
    return new ZeroHandicapCalculator();
}

function selectPointsCalculator(leagueScoringRules: LeagueScoringRules | undefined) : PointsCalculator {
    const type = leagueScoringRules?.pointScoring?.matchupPointScoringRule;
    if (type) {
        if (type === "PPG_PPS" && leagueScoringRules?.pointScoring?.ppgPpsMatchupPointScoringConfig) {
            const config = leagueScoringRules?.pointScoring?.ppgPpsMatchupPointScoringConfig;
            return new PpgPpsPointsCalculator(config?.pointsPerGame, config?.pointsPerGameOnTie, config?.pointsPerSeries, config?.pointsPerSeriesOnTie);
        }
    }
    console.debug("Missing or incorrect League Points Calculator, returning O points assignment", leagueScoringRules?.pointScoring);
    return new PpgPpsPointsCalculator(0, 0, 0, 0);
}

// ---------------------------------------------------------------------------------------------------------------------
// Loops through leagues
// ---------------------------------------------------------------------------------------------------------------------

function calculateFrameScores(playerGame: TeamPlayerGameScore) {

    const getNextNScores = (frames: Frame[], curIdx :number, count :number) :number  => {
        let toGet :number = count;
        let accum :number = 0;
        for (let i = curIdx + 1; i < frames.length && toGet > 0; i++) {
            accum += frames[i].ballScores[0][0];
            toGet --;
            if (toGet > 0 && frames[i].ballScores.length > 1) {
                accum += frames[i].ballScores[1][0];
                toGet --;
            }
        }
        return accum;
    }

    if (!playerGame.frames) {
        playerGame.frames = [];
    }
    // Build the Frame Objects
    for (let f: number = 0; f < playerGame.inFrames.length; f++) {
        // We assume Frame objects are not set, we set them
        const frame = new Frame();
        frame.number = f + 1;
        const inFrame = playerGame.inFrames[f];

        for (let b = 0; b < inFrame.length; b++) {
            let lbl = inFrame[b];
            if ((b == 0 || f == 9) && (lbl == "X" || (isNumeric(lbl) && Number(lbl) == 10))) {
                frame.ballScores[b] = [10, "X"];
            } else if (lbl == "F" || lbl == "-") {
                frame.ballScores[b] = [0, lbl];
            } else if (lbl == "/" && b > 0) {
                frame.ballScores[b] = [10 - frame.ballScores[b - 1][0], lbl];
            } else if (lbl.endsWith("S") && (b == 0 || (f == 9 && b < 2))) {
                frame.ballScores[b] = [Number.parseInt(lbl.substring(0, 1)), "S"];
            } else if (isNumeric(lbl)) {
                frame.ballScores[b] = [Number.parseInt(lbl)];
            }
        }
        playerGame.frames.push(frame);
    }

    // Calculate cumulative scores
    let scoreAccum = 0;
    let strikesInARow = 0;
    for (let i = 0; i < playerGame.frames.length; i++) {
        let currFrame = playerGame.frames[i];
        currFrame.ballScores.forEach((score) => {
            scoreAccum += score[0];
            if (i < 9) {
                // Not the 10th frame
                if (score[1] == "X") {
                    scoreAccum += getNextNScores(playerGame.frames, i, 2);
                } else if (score[1] == "/") {
                    scoreAccum += getNextNScores(playerGame.frames, i, 1);
                }
            }
            if (score[1] == "X") {
                strikesInARow ++;
            } else {
                strikesInARow = 0;
            }
        })
        currFrame.cumulativeScore = scoreAccum;

        // Frame Atrributes
        if (strikesInARow == 3) {
            currFrame.attributes.push("Turkey");
        } else if (strikesInARow == 12) {
            currFrame.attributes.push("Perfect-Game");
        }
    }

    // Set the scratch for the game
    if (playerGame.scratchScore == undefined || playerGame.scratchScore == 0) {
        playerGame.scratchScore = scoreAccum;
    }
}

function calculatePlayerScores(playerScore: LeagueTeamPlayerScore, hdcpCalculator: HandicapCalculator, scoringRules: LeagueScoringRules) {
    // Handle frames
    for (let g = 0; g < playerScore.games.length; g++) {
        const game = playerScore.games[g];
        if (game.scratchScore == 0 && game.inFrames && game.inFrames.length > 0) {
            calculateFrameScores(game);
        }
    }

    let hdcp = playerScore.enteringHdcp;
    if (hdcp == 0) {
        // Check if it is handicap setting day
        if (playerScore.hdcpSettingDay) {
            // TODO Handle Carry Over Pins
            hdcp = hdcpCalculator.calculateHandicap(hdcpCalculator.calculateAverge(playerScore.games));
        } else {
            hdcp = hdcpCalculator.calculateHandicap(playerScore.enteringAverage);
        }
        playerScore.enteringHdcp = hdcp;
    }

    // Update scores and series
    let seriesScratch = 0;
    let seriesEffectiveScratch = 0;
    let hdcpSeries = 0;
    playerScore.games.forEach(game => {
        game.hdcp = hdcp;
        if (game.blind) {
            // We don't have scratch score
            // TODO Deal with Handicap Penalty after missed games
            game.effectiveScratchScore = playerScore.enteringAverage - (scoringRules?.blindPenalty?.defaultPenalty ?? 0);
        } else {
            game.effectiveScratchScore = game.scratchScore;
        }
        game.hdcpScore = game.effectiveScratchScore + hdcp;
        seriesScratch += game.scratchScore;
        seriesEffectiveScratch += game.effectiveScratchScore;
        hdcpSeries += game.hdcpScore
    })

    // Update Series
    playerScore.series.scratchScore = seriesScratch;
    playerScore.series.effectiveScratchScore = seriesEffectiveScratch;
    playerScore.series.hdcp = hdcp * playerScore.games.length;
    playerScore.series.hdcpScore = hdcpSeries;
    playerScore.series.average = seriesScratch / playerScore.games.length;
    playerScore.series.games = playerScore.games.length;
}

export function assignScoresAndPoints (matchup: LeagueMatchup, scoringRules: LeagueScoringRules, hdcpCalculator: HandicapCalculator, pointsCalculator: PointsCalculator) : void {
    const teamScores = matchup.scores;
    const addGamesToSeries = (seriesScore: SeriesScore, matchupGames : MatchupGameScore[])=> {
        matchupGames.forEach(game => {
            seriesScore.scratchScore += game.scratchScore;
            seriesScore.effectiveScratchScore += game.effectiveScratchScore;
            seriesScore.hdcpScore += game.hdcpScore;
            seriesScore.hdcp += game.hdcp;
            seriesScore.games++;
        })
    }
    if (teamScores) {
        const getWithSetGameScores = (game: number) => {
            if (teamScores?.games.length <= game) {
                for (let i = 0; i < (game - teamScores?.games.length + 1); i++) {
                    teamScores?.games.push(new MatchupGameScore());
                }
            }
            return teamScores?.games[game];
        }

        // Set individual team scores
        teamScores.playerScores?.forEach((playerScore) => {
            calculatePlayerScores(playerScore, hdcpCalculator, scoringRules);
        })

        // Calculate Matchup Scores
        teamScores.playerScores?.forEach((playerScore) => {
            playerScore.games!.forEach((game, g) => {
                const matchupGame = getWithSetGameScores(g);
                matchupGame.scratchScore += game.scratchScore;
                matchupGame.effectiveScratchScore += game.effectiveScratchScore;
                matchupGame.hdcpScore += game.hdcpScore;
                matchupGame.hdcp += game.hdcp;
            })
        })

        // Sum Series
        addGamesToSeries(teamScores.series, teamScores.games);
    }

    if (matchup.opponent && matchup.opponent.scores) {
        // Set Handicap and Calculate totals
        matchup.opponent.scores.games!.forEach((game) => {
            game.hdcp = matchup.opponent?.teamHdcp ?? 0;
            game.effectiveScratchScore = game.scratchScore;
            game.hdcpScore = game.effectiveScratchScore + game.hdcp;
        })
        // Sum Series
        addGamesToSeries(matchup.opponent.scores.series, matchup.opponent.scores.games);
    }

    // Assign Points
    if (matchup.scores && matchup.opponent) {
        const opponent = matchup.opponent;
        if (opponent.absent || opponent.vacant) {
            // TODO Implement absent or vacant scoring
            throw Error("Absent or Vacant Scoring not yet impmented!")
        } else if (opponent.scores) {
            pointsCalculator.assignPoints(matchup.scores, opponent.scores);
        }

        let pointsWon = 0;
        let pointsLost = 0;
        matchup.scores.games.forEach((game) => {pointsWon += game.pointsWon});
        pointsWon += matchup.scores.series.pointsWon;
        matchup.opponent.scores?.games.forEach((game) => {pointsLost += game.pointsWon;});
        pointsLost += matchup.opponent.scores?.series.pointsWon ?? 0;
        matchup.pointsWonLost[0] = pointsWon;
        matchup.pointsWonLost[1] = pointsLost;
    }
}

function gatherLeagueStatsAndLeaders(league: LeagueDetails) {
    // "IND-SCRATCH-GAME" | "IND-SCRATCH-SERIES" | "TEAM-SCRATCH-GAME" | "TEAM-SCRATCH-SERIES" | "IND-HIGH-AVERAGE" | "IND-GAME-OVER-AVERAGE" | "IND-SERIES-OVER-AVERAGE";
    const indScratchGame : LeagueAccolade = {type: "IND-SCRATCH-GAME", who: "", when: undefined, howMuch: 0, description: ""};
    const indScratchSeries : LeagueAccolade = {type: "IND-SCRATCH-SERIES", who: "", when: undefined, howMuch: 0, description: ""};
    const teamScratchGame : LeagueAccolade = {type: "TEAM-SCRATCH-GAME", who: "", when: undefined, howMuch: 0, description: ""};
    const teamScratchSeries : LeagueAccolade = {type: "TEAM-SCRATCH-SERIES", who: "", when: undefined, howMuch: 0, description: ""};
    const indHighAverage : LeagueAccolade = {type: "IND-HIGH-AVERAGE", who: "", when: undefined, howMuch: 0, description: ""};
    const indGameOverAverage : LeagueAccolade = {type: "IND-GAME-OVER-AVERAGE", who: "", when: undefined, howMuch: 0, description: ""};
    const indSeriesOverAverage : LeagueAccolade = {type: "IND-SERIES-OVER-AVERAGE", who: "", when: undefined, howMuch: 0, description: ""};

    league.teams.forEach((team) => {
        const teamId = team.id ?? "UNKNOWN";
        team.matchups.forEach(matchup => {
            if (matchup.scores) {
                const bowlDate = matchup.bowlDate;
                matchup.scores.games.forEach((teamGame) => {
                    if (teamGame.scratchScore > teamScratchGame.howMuch) {
                        teamScratchGame.who = teamId;
                        teamScratchGame.when = bowlDate;
                        teamScratchGame.howMuch = teamGame.scratchScore;
                    }
                })
                if (matchup.scores.series.scratchScore > teamScratchSeries.howMuch) {
                    teamScratchSeries.who = teamId;
                    teamScratchSeries.when = bowlDate;
                    teamScratchSeries.howMuch = matchup.scores.series.scratchScore
                }

                if (matchup.scores.playerScores) {
                    matchup.scores.playerScores.forEach((playerScore) => {
                        const player = playerScore.player ?? "UNKNOWN";
                        const hdcpSettingDay = playerScore.hdcpSettingDay;
                        const enteringAverage = playerScore.enteringAverage;
                        playerScore.games.forEach((game) => {
                            if (game.scratchScore > indScratchGame.howMuch) {
                                indScratchGame.who = player;
                                indScratchGame.when = bowlDate;
                                indScratchGame.howMuch = game.scratchScore;
                            }
                            if (!hdcpSettingDay && !game.blind && (game.scratchScore - enteringAverage) > indGameOverAverage.howMuch) {
                                indGameOverAverage.who = player;
                                indGameOverAverage.when = bowlDate;
                                indGameOverAverage.howMuch = game.scratchScore - enteringAverage;
                                indGameOverAverage.description = game.scratchScore + " - " + enteringAverage + " = " + indGameOverAverage.howMuch;
                            }
                        });
                        if (playerScore.series.scratchScore > indScratchSeries.howMuch) {
                            indScratchSeries.who = player;
                            indScratchSeries.when = bowlDate;
                            indScratchSeries.howMuch = playerScore.series.scratchScore;
                        }
                        if (!hdcpSettingDay && (playerScore.series.scratchScore - (enteringAverage * playerScore.series.games)) > indSeriesOverAverage.howMuch) {
                            indSeriesOverAverage.who = player;
                            indSeriesOverAverage.when = bowlDate;
                            indSeriesOverAverage.howMuch = playerScore.series.scratchScore - (enteringAverage * playerScore.series.games);
                            indSeriesOverAverage.description = playerScore.series.scratchScore + " - " + (enteringAverage * playerScore.series.games) + " = " + indSeriesOverAverage.howMuch;
                        }
                    })
                }
            }
        })
    })
    // TODO Implement IND-HIGH_AVERAGE after ind stats is set
    league.leagueAccolades.push(indScratchGame, indScratchSeries, teamScratchGame, teamScratchSeries, indGameOverAverage, indSeriesOverAverage, indHighAverage);
}

export function decorateLeagueDetails (league : LeagueDetails) :LeagueDetails {
    const hdcpCalculator :HandicapCalculator = selectHandicapCalculator(league.scoringRules);
    const pointsCalculator : PointsCalculator = selectPointsCalculator(league.scoringRules);
    // Calculate scores and points
    const scoringRules: LeagueScoringRules = league.scoringRules ?? new LeagueScoringRules(); // Things will go really bad at this point
    league.teams?.forEach(team => {
        team.matchups?.forEach((matchup) => {
            assignScoresAndPoints(matchup, scoringRules, hdcpCalculator, pointsCalculator);
        })
    })

    // TODO Player stats
    // TODO Frame Atrributes

    // League stats and leaders
    gatherLeagueStatsAndLeaders(league);

    return league;
}