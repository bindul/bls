/*
 * Copyright (c) 2025. Bindul Bhowmik
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {TeamPlayerGameScore} from "../league/league-matchup";
import {PlayerStats, RatioGroup} from "./player-stats";
import * as ss from "simple-statistics";

class FrameStatCalculator {
    firstBallAccum: number = 0;
    firstBallCount: number = 0;
    cleanGameCount: number = 0;
    strikeCountAccum: number = 0;
    strikeOpportunitiesAccum: number = 0;
    pickedUpSpareAccum: number = 0;
    spareOpportunitiesAccum: number = 0;
    pickedUpSinglePinSpareAccum: number = 0;
    singlePinSpareOppportunitiesAccum: number = 0;
    pickedUpSplitSpareAccum: number = 0;
    splitSpareOppportunitiesAccum: number = 0;
    openFramesAccum: number = 0;
    totalFramesAccum: number = 0;
    strikesInARow: Map<number, number> = new Map();

    private saveStrikeCounter (strikes: number) {
        if (strikes >= 3) {
            if (this.strikesInARow.has(strikes)) {
                this.strikesInARow.set(strikes, (this.strikesInARow.get(strikes) ?? 0) + 1);
            } else {
                this.strikesInARow.set(strikes, 1);
            }
        }
    }

    addGame(game: TeamPlayerGameScore) {
        let potentialCleanGame = true;
        let strikeCounter = 0;
        game.frames.forEach(frame => {
            const ball1Score = frame.ballScores[0][0];
            const ball2Score = frame.ballScores.length > 1 ? frame.ballScores[1][0] : 0;
            const first2BallScores = ball1Score + ball2Score;
            const ball3Score = frame.ballScores.length > 2 ? frame.ballScores[2][0] : 0;
            const lastBallLabel = frame.ballScores[frame.ballScores.length - 1][1];
            const frameNum = frame.number;

            this.firstBallAccum += ball1Score;
            this.firstBallCount ++;

            if (lastBallLabel == undefined || (lastBallLabel !== "X" && lastBallLabel !== "/")) {
                potentialCleanGame = false;
                if (frameNum < 10 || (frameNum == 10 && frame.ballScores.length == 2)) {
                    this.openFramesAccum++; // According to PinPal, if you make it to the 3rd ball in 10th frame, it's not an open
                }
            }

            if (ball1Score == 10 || ball2Score == 10 || ball3Score == 10) {
                this.strikeCountAccum++;
            }

            // Strikes in a row counter
            if (ball1Score == 10) {
                strikeCounter++;
            } else {
                this.saveStrikeCounter(strikeCounter);
                strikeCounter = 0;
            }
            if (frameNum == 10) {
                if (ball2Score == 10) {
                    strikeCounter++;
                } else {
                    this.saveStrikeCounter(strikeCounter);
                    strikeCounter = 0;
                }
                if (ball3Score == 10) {
                    strikeCounter++;
                } else {
                    this.saveStrikeCounter(strikeCounter);
                    strikeCounter = 0;
                }
            }

            // Spare counts
            if (ball1Score < 10) {
                this.spareOpportunitiesAccum++;
                const singlePin = ball1Score == 9;
                const split = !!(frame.ballScores[0][1] && frame.ballScores[0][1] == "S");
                if (singlePin) {
                    this.singlePinSpareOppportunitiesAccum++;
                }
                if (split) {
                    this.splitSpareOppportunitiesAccum++;
                }
                if (first2BallScores == 10) {
                    this.pickedUpSpareAccum++;
                    if (singlePin) {
                        this.pickedUpSinglePinSpareAccum++;
                    }
                    if (split) {
                        this.pickedUpSplitSpareAccum++;
                    }
                }
            }

            if (frameNum == 10) {
                // Set the strike opportunities - number of full racks
                if (ball2Score == 10 && ball2Score == 10) {
                    this.strikeOpportunitiesAccum += 12;
                } else if (ball1Score == 10 || first2BallScores == 10) {
                    this.strikeOpportunitiesAccum += 11;
                } else {
                    this.strikeOpportunitiesAccum += 10;
                }

                // Spare counts for second & third ball
                if (ball1Score == 10 && ball2Score < 10) {
                    this.spareOpportunitiesAccum++;
                    const singlePin = ball2Score == 9;
                    const split = !!(frame.ballScores[1][1] && frame.ballScores[1][1] == "S");
                    if (singlePin) {
                        this.singlePinSpareOppportunitiesAccum++;
                    }
                    if (split) {
                        this.splitSpareOppportunitiesAccum++;
                    }
                    if (ball2Score + ball3Score == 10) {
                        this.pickedUpSpareAccum++;
                        if (singlePin) {
                            this.pickedUpSinglePinSpareAccum++;
                        }
                        if (split) {
                            this.pickedUpSplitSpareAccum++;
                        }
                    }
                }
            }
        });
        this.totalFramesAccum += game.frames.length;
        this.saveStrikeCounter(strikeCounter); // Someone might finish on a strike
        if (potentialCleanGame) {
            this.cleanGameCount++;
        }
    }

    getFirstBallAverage() {
        return (this.firstBallCount == 0) ? 0 : this.firstBallAccum / this.firstBallCount;
    }
}

export function calculatePlayerStats(series: TeamPlayerGameScore[][], stats: PlayerStats, gamesCount: number = 3) {
    const gameScoresByGame :number[][] = [];
    for (let i = 0; i < gamesCount; i++) {
        gameScoresByGame.push([]);
    }
    const allGameScores : number[] = [];
    const seriesScores :number[] = [];
    const frameStatsCalculator = new FrameStatCalculator();

    series.forEach(serie => {
        let seriesAccum = 0;
        let hasBlind = false;
        for (let i = 0; i < gamesCount; i++) {
            const gameScore = serie[i];
            if (gameScore && !gameScore.blind) {
                gameScoresByGame[i].push(gameScore.scratchScore);
                allGameScores.push(gameScore.scratchScore);
                seriesAccum += gameScore.scratchScore;
                if (gameScore.scratchScore == 300) {
                    stats.games300 += 1;
                }
                if (gameScore.frames && gameScore.frames.length > 0) {
                    frameStatsCalculator.addGame(gameScore);
                } else {
                    stats.incompleteFrameData = true;
                }
            } else {
                hasBlind = true
            }
        }
        if (!hasBlind) {
            seriesScores.push(seriesAccum);
            if (seriesAccum > 800) {
                stats.series800 += 1;
            }
        }
    });

    // Games & Series
    stats.seriesStats.count = seriesScores.length;
    if (seriesScores.length > 0) {
        stats.seriesStats.min = ss.min(seriesScores);
        stats.seriesStats.max = ss.max(seriesScores);
        stats.seriesStats.average = ss.mean(seriesScores);
        stats.seriesStats.sd = ss.standardDeviation(seriesScores);
    }

    gameScoresByGame.forEach((gameXScore) => {
        stats.gameAverages.push(ss.mean(gameXScore));
    })

    stats.gameStats.count = allGameScores.length;
    if (allGameScores.length > 0) {
        stats.gameStats.min = ss.min(allGameScores);
        stats.gameStats.max = ss.max(allGameScores);
        stats.gameStats.average = ss.mean(allGameScores);
        stats.gameStats.sd = ss.standardDeviation(allGameScores);

        stats.pinfall = ss.sum(allGameScores);
    }

    // Frame stats
    stats.cleanGames = frameStatsCalculator.cleanGameCount;
    stats.firstBallAverage = frameStatsCalculator.getFirstBallAverage();
    stats.strikes = new RatioGroup(frameStatsCalculator.strikeCountAccum, frameStatsCalculator.strikeOpportunitiesAccum);
    stats.spares = new RatioGroup(frameStatsCalculator.pickedUpSpareAccum, frameStatsCalculator.spareOpportunitiesAccum);
    stats.singlePinSpares = new RatioGroup(frameStatsCalculator.pickedUpSinglePinSpareAccum, frameStatsCalculator.singlePinSpareOppportunitiesAccum);
    stats.splits = new RatioGroup(frameStatsCalculator.pickedUpSplitSpareAccum, frameStatsCalculator.splitSpareOppportunitiesAccum);
    stats.opens = new RatioGroup(frameStatsCalculator.openFramesAccum, frameStatsCalculator.totalFramesAccum);
    stats.strikesToSpares = new RatioGroup(frameStatsCalculator.strikeCountAccum, frameStatsCalculator.pickedUpSpareAccum);

    frameStatsCalculator.strikesInARow.forEach((value, key) => {
        stats.strikesInARow.push([key, value]);
    })
    stats.strikesInARow.sort((a, b) => a[0] - b[0]);
}