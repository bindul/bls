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

export class StatGroup {
    count = 0;
    average = 0;
    min = 0;
    max = 0;
    sd = 0;
}

export class RatioGroup {
    numerator = 0;
    denominator = 0;
    pct = 0;

    constructor (numerator = 0, denominator = 0) {
        this.numerator = numerator;
        this.denominator = denominator;
        this.pct = (denominator == 0) ? 0 : numerator / denominator;
    }
}

export type StrikesInARow = [number, number];

export class PlayerStats {
    incompleteFrameData = false;
    pinfall = 0;
    gameStats: StatGroup = new StatGroup();
    seriesStats: StatGroup = new StatGroup();
    gameAverages: number[] = [];
    firstBallAverage = 0;
    strikes: RatioGroup = new RatioGroup();
    spares: RatioGroup = new RatioGroup();
    singlePinSpares: RatioGroup = new RatioGroup();
    opens: RatioGroup = new RatioGroup();
    splits: RatioGroup = new RatioGroup();
    strikesToSpares: RatioGroup = new RatioGroup();
    cleanGames = 0;
    games300 = 0;
    series800 = 0;
    strikesInARow: StrikesInARow[] = [];
    allSinglePinsPickedUpAverage = 0;
}
