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
import Alert from 'react-bootstrap/Alert'
import {ExclamationOctagonFill} from "react-bootstrap-icons";
import * as React from "react";

interface ErrorDisplayProps {
    message?: string;
    error?: Error;
    onClose?: (show: boolean, event: any) => void;
}

function ErrorDetails({error} :ErrorDisplayProps) {
    if (error != undefined) {
        const em = error.name + " " + error.message;
        return (
            <>
                <hr />
                <p className="mb-0 font-monospace">For the nerds: {em}</p>
            </>
        );
    }
    return (<></>);
}

const Error:React.FC<ErrorDisplayProps> = (props :ErrorDisplayProps) => {
    // TODO May need to capture the close event and allow callbacks
    return (
        <div className="alert-top">
            <Alert variant="warning" dismissible onClose={props.onClose}>
                <Alert.Heading><ExclamationOctagonFill/> Your last action failed!</Alert.Heading>
                {props.message && <p>{props.message}</p>}
                <ErrorDetails error={props.error} />
            </Alert>
        </div>
    );
}

export default Error;