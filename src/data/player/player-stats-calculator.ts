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

import {Frame, TeamPlayerGameScore} from "../league/league-matchup";
import {PlayerStats, RatioGroup} from "./player-stats";
import * as ss from "simple-statistics";
import {accumulateFrameScores} from "../league/league-calculators";

class FrameStatCalculator {
    firstBallAccum = 0;
    firstBallCount = 0;
    cleanGameCount = 0;
    strikeCountAccum = 0;
    strikeOpportunitiesAccum = 0;
    pickedUpSpareAccum = 0;
    spareOpportunitiesAccum = 0;
    pickedUpSinglePinSpareAccum = 0;
    singlePinSpareOppportunitiesAccum = 0;
    pickedUpSplitSpareAccum = 0;
    splitSpareOppportunitiesAccum = 0;
    openFramesAccum = 0;
    totalFramesAccum = 0;
    strikesInARow = new Map<number, number>();
    singlePinsPickedUpGameScores: number[] = [];

    private saveStrikeCounter (strikes: number) {
        if (strikes >= 3) {
            if (this.strikesInARow.has(strikes)) {
                this.strikesInARow.set(strikes, (this.strikesInARow.get(strikes) ?? 0) + 1);
            } else {
                this.strikesInARow.set(strikes, 1);
            }
        }
    }

    private computeAllSinglePinsPickedUpGameScore (game: TeamPlayerGameScore) : number {
        if (game.frames.length === 0) {
            // No frames available, we can't do anything
            return game.scratchScore;
        }

        const copyFrame = (frame: Frame) : Frame => {
            const nf = new Frame();
            nf.number = frame.number;
            nf.ballScores = frame.ballScores.map(bs => [bs[0], bs[1]]);
            return nf;
        }

        const simulateSinglePinSpare = (frame: Frame, ball: number)=> {
            frame.ballScores[ball - 1][0] = 1;
            frame.ballScores[ball - 1][1] = "/";
        }

        const newFrames : Frame[] = game.frames.map(frame => copyFrame(frame));
        newFrames.forEach(frame => {
            if (frame.ballScores[0][0] == 9 && frame.ballScores[1][0] == 0) {
                simulateSinglePinSpare(frame, 2);
            }
            if (frame.number == 10 && frame.ballScores[0][0] == 10 && frame.ballScores[1][0] == 9 && frame.ballScores[2][0] == 0) {
                simulateSinglePinSpare(frame, 3);
            }
        })
        return accumulateFrameScores(newFrames);
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
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (potentialCleanGame) {
            this.cleanGameCount++;
        }
        this.singlePinsPickedUpGameScores.push(this.computeAllSinglePinsPickedUpGameScore(game));
    }

    getFirstBallAverage() {
        return (this.firstBallCount == 0) ? 0 : this.firstBallAccum / this.firstBallCount;
    }
}

export function calculatePlayerStats(series: TeamPlayerGameScore[][], stats: PlayerStats, gamesCount = 3) {
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
            if (!gameScore.blind) {
                gameScoresByGame[i].push(gameScore.scratchScore);
                allGameScores.push(gameScore.scratchScore);
                seriesAccum += gameScore.scratchScore;
                if (gameScore.scratchScore == 300) {
                    stats.games300 += 1;
                }
                if (gameScore.frames.length > 0) {
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
        stats.gameAverages.push((gameXScore.length > 0) ? ss.mean(gameXScore) : 0);
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

    if (frameStatsCalculator.singlePinsPickedUpGameScores.length > 0) {
        stats.allSinglePinsPickedUpAverage = ss.mean(frameStatsCalculator.singlePinsPickedUpGameScores);
    }
}