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

import {isNumeric} from '../data/utils/utils.ts';

// Series - Game - Frame Scores

export interface ScoreHolder {
    'score': number;
    'hdcpScore': number;
}

/*
    ["8S", "/"]
 */
export type ScoreLabel = "X" | "/" | "S" | "F" | "-";
export type FrameAttributes = "Hung" | "Star" | "Turkey" | "Hambone" | "PerfectGame";
export class Frame {
    'number': number;
    'ballScores': [number, ScoreLabel?][];
    'cumulativeScore': number;
    'attributes': FrameAttributes[];

    constructor(frameNumber: number, data: string[]) {
        this.number = frameNumber;
        this.ballScores = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            let lbl = data[i];
            if (lbl == "X") {
                this.ballScores[i] = [10, lbl];
            } else if (lbl == "F" || lbl == "-") {
                this.ballScores[i] = [0, lbl];
            } else if (lbl == "/" && i > 0) {
                this.ballScores[i] = [10 - this.ballScores[i - 1][0], lbl];
            } else if (lbl.endsWith("S")) {
                let scr = lbl.substring(0, lbl.length - 1);
                this.ballScores[i] = [Number(scr), "S"];
            } else if (isNumeric(lbl)) {
                this.ballScores[i] = [Number.parseInt(lbl)];
            }
        }
    }

    addAttribute(attribute: FrameAttributes) {
        if (this.attributes == null) {
            this.attributes = [];
        }
        this.attributes.push(attribute);
    }
}

/*
    {
      "blind": false,
      "score": 100, // Optional
      "hdcp-score": 120, // Optional
      "arsenal": [
        ""
      ],
      "notes": [
        ""
      ],
      "frames": [["8S", "/"], ["X"], ["-", "/"]]
    }
 */
export class Game implements ScoreHolder {

    'score': number;
    'hdcpScore': number;

    'number': number;
    'blind': boolean;
    'arsenal': string[];
    'notes': string[];
    'frames': Frame[];

    constructor(gameNumber: number, hdcp: number, data: any) {
        this.number = gameNumber;
        this.blind = data.blind;
        this.arsenal = data.arsenal;
        this.notes = data.notes;
        this.score = data.score;
        this.hdcpScore = data['hdcp-score'];

        // Frames
        if (data.frames != null && data.frames.length > 0) {
            let frameCounter = 1;
            this.frames = data.frames.map((f: string[]) => new Frame(frameCounter++, f)) as Frame[];

            // Score Counter
            let scoreAccum = 0;
            let strikesInARow = 0;
            for (let i = 0; i < this.frames.length; i++) {
                let currFrame = this.frames[i];
                currFrame.ballScores.forEach((score) => {
                    scoreAccum += score[0];
                    if (i < 9) {
                        // Not the 10th frame
                        if (score[1] == "X") {
                            scoreAccum += this.getNextNScores(i, 2);
                        } else if (score[1] == "/") {
                            scoreAccum += this.getNextNScores(i, 1);
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
                    currFrame.addAttribute("Turkey");
                } else if (strikesInARow == 4) {
                    currFrame.addAttribute("Hambone");
                } else if (strikesInARow == 12) {
                    currFrame.addAttribute("PerfectGame");
                }
            }
            if (data.score == undefined || data.score == 0) {
                this.score = scoreAccum;
            }
        }

        // TODO Implement Blind Scores
        // TODO Implement Blind Penalty

        if (hdcp != null && (this.hdcpScore == null || this.hdcpScore == 0)) {
            this.updateHandicap(hdcp);
        }
    }

    updateHandicap(hdcp: number) {
        this.hdcpScore = this.score + hdcp;
    }

    private getNextNScores (curIdx :number, count :number) :number {
        let toGet :number = count;
        let accum :number = 0;
        for (let i = curIdx + 1; i < this.frames.length && toGet > 0; i++) {
            accum += this.frames[i].ballScores[0][0];
            toGet --;
            if (toGet > 0 && this.frames[i].ballScores.length > 1) {
                accum += this.frames[i].ballScores[1][0];
                toGet --;
            }
        }
        return accum;
    }
}

/*
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
 */
export class Series implements ScoreHolder {

    'score': number;
    'hdcpScore': number;

    'player': string;
    'league'?: string;
    'enteringAverage': number;
    'average': number;
    'hdcp': number;
    'hdcpSettingDay': boolean;
    'notes': string[];
    'games': Game[];

    constructor(data: any, league?: string) {
        this.league = league;
        this.player = data.player;
        this.enteringAverage = data['entering-average'];
        this.hdcp = data.hdcp; // TODO Future: calculate HDCP from hdcp setting day
        this.hdcpSettingDay = data['hdcp-setting-day'];
        this.notes = data.notes;

        this.score = data.score;
        this.hdcpScore = data['hdcp-score'];

        // Games
        if (data.games != null && data.games.length > 0) {
            let gameCounter = 1;
            this.games = data.games.map((g: string[]) => new Game(gameCounter++, this.hdcp, g)) as Game[];

            // Score Counter
            this.calculateScores();
        }
    }

    calculateScores() {
        let scoreAccum = 0;
        let hdcpScoreAccum = 0;
        this.games.forEach(game => {
            scoreAccum += game.score;
            hdcpScoreAccum += game.hdcpScore;
        })
        if (this.score == null || this.score == 0) {
            this.score = scoreAccum;
        }
        if (this.hdcpScore == null || this.hdcpScore == 0) {
            this.hdcpScore = hdcpScoreAccum;
        }
        this.average = scoreAccum / this.games.length;
    }
}
