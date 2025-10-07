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

import type {FormEvent, FC} from "react";
import {useState} from "react";
import {Card, CardHeader, CardBody, Form, Button, CardText, Alert} from "react-bootstrap";
import {isNumeric} from "../../../data/utils/utils.ts";

const getNextChar = (input: string, ptr: number): string | null => {
    if (ptr < input.length) {
        const ch = input.charAt(ptr);
        return isNumeric(ch) ? ch : ch.toUpperCase();
    }
    return null;
}

const convertScore = (rawScore: FormDataEntryValue | null) : string | null => {
    if (rawScore != null && typeof rawScore === "string") {
        const scores: string[][] = [];
        const rawScoreStr: string = rawScore;

        if (rawScoreStr.length > 0) {
            let ptr = 0;
            for (let fr = 1; fr <= 10; fr++) {
                const frameScore: string[] = [];
                // ball 1
                const b1a = getNextChar(rawScoreStr, ptr);
                if (b1a == null) {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    throw new Error(`Missing first ball score for frame: ${fr}`);
                }
                if (b1a == "-" || b1a == "X" || isNumeric(b1a)) {
                    frameScore.push(b1a);
                    ptr++;
                    if (isNumeric(b1a)) {
                        const b1b = getNextChar(rawScoreStr, ptr);
                        if (null != b1b && b1b == "S") {
                            frameScore[0] = b1a + b1b;
                            ptr++;
                        }
                    }
                } else {
                    throw new Error(`Invalid ball 1 score for frame: ${fr}`);
                }

                if (b1a != "X" || fr == 10) {
                    // ball 2
                    const b2a = getNextChar(rawScoreStr, ptr);
                    if (b2a == null) {
                        throw new Error(`Missing second ball score for frame: ${fr}`);
                    }
                    if (b2a == "-" || b2a == "/" || isNumeric(b2a) || (fr == 10 && b2a == "X")) {
                        frameScore.push(b2a);
                        ptr++;
                        if (fr == 10 && isNumeric(b2a)) {
                            const b2b = getNextChar(rawScoreStr, ptr);
                            if (null != b2b && b2b == "S") {
                                frameScore[1] = b2a + b2b;
                                ptr++;
                            }
                        }
                    } else {
                        throw new Error(`Invalid ball 2 score for frame: ${fr}`);
                    }

                    if (fr == 10 && (frameScore[0] == "X" || frameScore[1] == "/")) {
                        // ball 3
                        const b3 = getNextChar(rawScoreStr, ptr);
                        if (b3 == null) {
                            throw new Error(`Missing third ball score for frame: ${fr}`);
                        }
                        if (b3 == "-" || b3 == "X" || b3 == "/" || isNumeric(b3)) {
                            frameScore.push(b3);
                            ptr++;
                        } else {
                            throw new Error(`Invalid ball 3 score for frame: ${fr}`);
                        }
                    }
                }

                scores.push(frameScore);
            }
            return JSON.stringify(scores);
        }
    }
    return null;
}

const ScoreConverter : FC = () => {

    const [formattedScore, setFormattedScore] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    const handleChange = () => {
        setFormattedScore(null);
        setError("");
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        try {
            setFormattedScore(convertScore(f.get("rawScore")));
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
            <CardBody className="border border-secondary py-1 my-1">
                <Form onSubmit={handleSubmit} onChange={handleChange}>
                    <Form.Group className="mb-3" controlId="rawScore">
                        <Form.Label>Frame Scores</Form.Label>
                        <Form.Control type="text" placeholder="Enter Raw Frame Scores" name="rawScore"/>
                        <Form.Text className="text-muted">Enter all frame score lines for player without spaces, suffix splits with 'S'</Form.Text>
                        {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
                    </Form.Group>
                    <Button variant="primary" type="submit">Convert for BLS</Button>
                </Form>
                {error && <Alert variant="danger">{error}</Alert>}
            </CardBody>
        </Card>
        {formattedScore &&
            <Card bg="secondary">
                <CardBody>
                    <CardText>{formattedScore}</CardText>
                </CardBody>
            </Card>
        }
    </>)
}

export default ScoreConverter;