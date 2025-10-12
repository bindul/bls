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

import type {FormEvent, ChangeEvent, FC} from "react";
import {useState} from "react";
import {Link} from "react-router-dom";
import {
    Card,
    CardHeader,
    CardBody,
    Form,
    Button,
    Alert,
    Row,
    Col,
    CardTitle, Stack
} from "react-bootstrap";
import {DashSquareFill, PlusSquareFill} from "react-bootstrap-icons";
import stringify from "json-stringify-pretty-compact"

import {isNonEmptyString, isNumeric} from "../../../data/utils/utils";
import {LeagueTeamPlayerScore, TeamPlayerGameScore} from "../../../data/league/league-matchup";
import {createJsonConverter} from "../../../data/utils/json-utils";
import {accumulateFrameScores, buildFrames} from "../../../data/league/league-calculators";



const VALID_STANDALONE_SCORE_CHARS = [
    ["X", "F", "-"],
    ["/", "F", "-"]
];
const convertScore = (rawScore: string) : string[][] => {

    const retrieveChar = (input :string, ptr: number) => {
        const ch = input.charAt(ptr);
        return isNumeric(ch) ? ch : ch.toUpperCase();
    }

    const formatFrameBallScore = (validStandaloneChars: string[], ba :string, fr :number) => {
        if (validStandaloneChars.includes(ba)) {
            currFrame.push(ba);
        } else if (isNumeric(ba)) {
            let bab = ba;
            if (validStandaloneChars.includes("X")) {
                // Splits are only allowed where you are allowed to have a strike
                const nextChar = (ptr +1 < len) ? retrieveChar(rawScore, ptr + 1) : null;
                if (nextChar === "S") {
                    bab = bab + nextChar;
                    ptr++;
                }
            }
            currFrame.push(bab);
        } else {
            throw new Error(`Invalid score character [${ba}] for frame: ${fr}`);
        }
    }

    const len = rawScore.length;
    const scores :string[][] = [];
    let currFrame :string[] = [];
    let ptr :number = 0;
    while (ptr < len && scores.length < 10) {
        const fr = scores.length + 1;
        const bn = currFrame.length + 1;
        const ba = retrieveChar(rawScore, ptr);
        if (fr != 10 || (fr == 10 && bn == 1)) { // Ball 1 or any ball of frames 1-9
            formatFrameBallScore(VALID_STANDALONE_SCORE_CHARS[bn - 1], ba, fr);
            if (bn == 2 || (ba == "X" && fr < 10)) {
                scores.push(currFrame);
                currFrame = [];
            }
        } else if (fr == 10 && (bn == 2 || bn == 3)) { // Frame 10, ball 2 or 3
            const lastBall = currFrame[bn - 2];
            // If the last ball is an X or /, treat it as a first ball (fresh rack)
            formatFrameBallScore(VALID_STANDALONE_SCORE_CHARS[(lastBall === "X" || lastBall === "/") ? 0 : 1], ba, fr);
        }
        ptr++;
    }

    if (currFrame.length > 0) {
        // Leftover from the 10th frame or partial frames?
        scores.push(currFrame);
    }

    return scores;
}

interface GameScoreForm {
    game: number;
    isBlind: boolean;
    isVacant: boolean;
    arsenal: string[];
    rawScore: string;
    formattedScore: string[][];
    error: string;
    calculatedScore: number;
}

interface PlayerScoreForm {
    playerId: string;
    hdcpSettingDay: boolean;
    enteringAvg: number;
    games: GameScoreForm[];
}

function createGameScoreForm (data: Partial<GameScoreForm>): GameScoreForm {
    const defaultGameScoreForm: GameScoreForm = {
        game: 0,
        isBlind: false,
        isVacant: false,
        arsenal: new Array(0),
        rawScore: '',
        formattedScore: [],
        error: '',
        calculatedScore: 0
    }

    return {
        ...defaultGameScoreForm,
        ...data,
    };
}

function formatPlayerScore (data: PlayerScoreForm) {
    const ltps :LeagueTeamPlayerScore = new LeagueTeamPlayerScore();
    ltps.player = data.playerId;
    ltps.hdcpSettingDay = data.hdcpSettingDay;
    if (!ltps.hdcpSettingDay) {
        ltps.enteringAverage = data.enteringAvg;
    }
    ltps.games = data.games.map(gsf => {
        const g = new TeamPlayerGameScore();
        g.blind = gsf.isBlind;
        g.vacant = gsf.isVacant;
        g.arsenal = gsf.arsenal;
        if (!g.blind && !g.vacant) {
            g.inFrames = gsf.formattedScore;
        }
        return g;
    })

    const jsonObject = createJsonConverter().serialize(ltps, LeagueTeamPlayerScore);
    // return JSON.stringify(jsonObject, null, 2);
    const filteredKeys = ["scratch-score", "hdcp", "hdcp-score"]
    const filteredBooleanDefaults = ["blind", "vacant", "hdcp-setting-day"]
    const filteredEmptyArrays = ["arsenal", "frames"]
    return stringify(jsonObject, {maxLength: 150, indent: 2, replacer: (key, value) => {
            if (filteredKeys.includes(key)) {
                return undefined;
            } else if (filteredBooleanDefaults.includes(key) && value === false) {
                return undefined;
            } else if (filteredEmptyArrays.includes(key) && Array.isArray(value) && value.length == 0) {
                return undefined;
            }
            return value;
        }});
}

const ScoreConverter : FC = () => {

    const [formattedScore, setFormattedScore] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    const [playerId, setPlayerId] = useState<string>('');
    const [isHdcpSettingDay, setHdcpSettingDay] = useState<boolean>(false);
    const [enteringAvg, setEnteringAvg] = useState<number>(0);
    const [gameScores, setGameScores] = useState<GameScoreForm[]>([
        createGameScoreForm({game: 1}),
        createGameScoreForm({game: 2}),
        createGameScoreForm({game: 3})
    ]);

    const updateScore = (updatedScore: GameScoreForm, value: string) => {
        updatedScore.rawScore = value;
        updatedScore.error = "";
        try {
            if (isNonEmptyString(value)) {
                updatedScore.formattedScore = convertScore(value);
                updatedScore.calculatedScore = accumulateFrameScores(buildFrames(updatedScore.formattedScore));
            } else {
                updatedScore.formattedScore = [];
                updatedScore.calculatedScore = 0;
            }
        } catch (e) {
            console.log(e);
            if (e instanceof Error) {
                updatedScore.error = e.message;
            }
        }
    }

    const handleRawScoreChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        const updatedScores = [...gameScores];
        updateScore(updatedScores[index], value);
        setGameScores(updatedScores);
    }

    const handleHdcpSettingDayChange = (event: ChangeEvent<HTMLInputElement>) => {
        setHdcpSettingDay(event.target.checked);
        if (!isHdcpSettingDay) {
            setEnteringAvg(0);
        }
    }

    const handleBlindOrVacantChange= (index: number, event: ChangeEvent<HTMLInputElement>)=> {
        const {name, checked} = event.target;
        const updatedScores = [...gameScores];
        if (name === "is-blind") {
            updatedScores[index].isBlind = checked;
        } else if (name === "is-vacant") {
            updatedScores[index].isVacant = checked;
        }
        if (checked) {
            updateScore(updatedScores[index], "");
        }
        setGameScores(updatedScores);
    }

    const handleArsenalChange = (gameIdx: number, arsenalIdx: number, event: ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        const updatedScores = [...gameScores];
        const updatedArsenal = [...updatedScores[gameIdx].arsenal];
        updatedArsenal[arsenalIdx] = value;

        updatedScores[gameIdx].arsenal = updatedArsenal;
        setGameScores(updatedScores);
    }
    const handleArsenalAdd = (gameIdx: number) => {
        const updatedScores = [...gameScores];
        updatedScores[gameIdx].arsenal = [...updatedScores[gameIdx].arsenal, ""];
        setGameScores(updatedScores);
    }
    const handleArsenalRemove = (gameIdx: number, arsenalIdx: number) => {
        const updatedScores = [...gameScores];
        updatedScores[gameIdx].arsenal = updatedScores[gameIdx].arsenal.filter((_item, index) => index != arsenalIdx);
        setGameScores(updatedScores);
    }

    const handleChange = () => {
        setFormattedScore(null);
        setError("");
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const playerData: PlayerScoreForm = {
                playerId: playerId,
                hdcpSettingDay: isHdcpSettingDay,
                enteringAvg: enteringAvg,
                games: gameScores
            }
            // setFormattedScore(convertScore(f.get("rawScore")));
            setFormattedScore(formatPlayerScore(playerData));
        } catch (e) {
            console.log(e);
            if (e instanceof Error) {
                setError(e.message);
            }
        }
    }

    return (<>
        <Card border="success" className="mb-3 justify-content-center">
            <CardHeader as="h4">Frame Score Converter</CardHeader>
            <Form onSubmit={handleSubmit} onChange={handleChange} noValidate={true}>
                <CardBody className="border border-secondary py-1 my-1">
                    <Row>
                        <Col>
                            <Form.Group controlId="player-id">
                                <Form.Label>Player</Form.Label>
                                <Form.Control type="text" placeholder="Player Id" value={playerId} name="player-id"
                                    onChange={(e :ChangeEvent<HTMLInputElement>) => setPlayerId(e.target.value)} />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="hdcp-setting-day">
                                <Form.Label>Handicap Setting Day</Form.Label>
                                <Form.Check type="switch" checked={isHdcpSettingDay} name="hdcp-setting-day" onChange={handleHdcpSettingDayChange}/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="entering-avg">
                                <Form.Label>Entering Average</Form.Label>
                                <Form.Control type="number" min={0} max={300} name="entering-avg" disabled={isHdcpSettingDay}
                                    placeholder="0" value={enteringAvg}
                                    onChange={(e :ChangeEvent<HTMLInputElement>) => setEnteringAvg(e.target.valueAsNumber)}/>
                            </Form.Group>
                        </Col>
                    </Row>
                </CardBody>
                {gameScores.map((gameScore, index) => (
                    <CardBody className="border bg-secondary-subtle py-1 my-2 mx-1" key={index}>
                        <CardTitle className="text-muted bg-secondary p-1">Game: {gameScore.game}</CardTitle>
                            <Row>
                                <Col>
                                    <Form.Group controlId={"is-blind-" + index}>
                                        <Form.Label>Blind ?</Form.Label>
                                        <Form.Check type="switch" checked={gameScore.isBlind} name="is-blind"
                                            onChange={(e) => handleBlindOrVacantChange(index, e)}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group controlId={"is-vacant-" + index}>
                                        <Form.Label>Vacant ?</Form.Label>
                                        <Form.Check type="switch" checked={gameScore.isVacant} name="is-vacant"
                                             onChange={(e) => handleBlindOrVacantChange(index, e)}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group controlId={"arsenal-" + index}>
                                        <Form.Label>Arsenal</Form.Label>&nbsp;<Link to="#" onClick={() => handleArsenalAdd(index)}><PlusSquareFill/></Link>
                                        <Stack direction="horizontal" gap={1}>
                                            {gameScore.arsenal.map((arsenal, aIndex) => (<>
                                                <div>
                                                    <Form.Control size="sm" type="text" placeholder="Arsenal" maxLength={8}
                                                                  name="arsenal" value={arsenal}
                                                                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleArsenalChange(index, aIndex, e)}/>
                                                </div>
                                                <div>
                                                    <Link to="#" onClick={() => handleArsenalRemove(index, aIndex)}><DashSquareFill/></Link>
                                                </div>
                                            </>))}
                                        </Stack>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Group controlId="raw-score">
                                        <Form.Label>Frame Scores (raw)</Form.Label>
                                        <Form.Control type="text" placeholder="Enter Raw Frame Scores" name="raw-score" value={gameScore.rawScore}
                                            onChange={(e :ChangeEvent<HTMLInputElement>) => handleRawScoreChange(index, e)}/>
                                        <Form.Text className="text-muted">Enter all frame score lines for player without spaces, suffix splits with 'S'</Form.Text>
                                    </Form.Group>
                                    {gameScore.error && <Alert variant="warning">{gameScore.error}</Alert>}
                                </Col>
                                <Col>
                                    <Form.Label>Frame Scores (formatted)</Form.Label>
                                    <Stack direction="horizontal" gap={1} className="me-auto">
                                        {gameScore.formattedScore && gameScore.formattedScore.map((fs, fidx) => (
                                            <div className="border rounded-1 border-dark-subtle border-opacity-10 h-100"
                                                 style={{width: "10%", maxWidth: "45px"}} key={`g-${index}-f-${fidx}`}>
                                                <Stack direction="horizontal" className="fs-6 justify-content-evenly">
                                                    {fs.map((b, bidx) => (
                                                        <div key={`g-${index}-f-${fidx}-b-${bidx}`}>{b}</div>
                                                    ))}
                                                </Stack>
                                            </div>
                                        ))}
                                        <div className="me-auto"/>
                                        <div className="border rounded-1 border-dark bg-dark text-white text-center fs-6 fw-bold px-2">{gameScore.calculatedScore}</div>
                                    </Stack>
                                </Col>
                            </Row>
                    </CardBody>
                ))}
                <CardBody className="border border-secondary py-1 my-1">
                    <Button variant="primary" type="submit">Convert for BLS</Button>
                    {error && <Alert variant="danger">{error}</Alert>}
                </CardBody>
            </Form>
        </Card>
        {formattedScore &&
            <Card bg="secondary">
                <CardBody>
                    <pre>
                        <code>{formattedScore}</code>
                    </pre>
                </CardBody>
            </Card>
        }
    </>)
}

export default ScoreConverter;