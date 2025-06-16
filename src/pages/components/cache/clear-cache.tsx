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

import {type ForwardedRef, useImperativeHandle, useState} from "react";
import {Toast, ToastContainer} from "react-bootstrap";
import {DatabaseX} from "react-bootstrap-icons";
import Loader from "../loader";
import {useContextCache} from "./context-cache";

export interface ClearCacheRef {
    clearCache: () => void;
}

interface ClearCacheProps {
    ref : ForwardedRef<ClearCacheRef>;
}
const ClearCache = ({ ref }: ClearCacheProps) => {
    const [toastVisible, setToastVisible] = useState<boolean>(false);
    const [cacheCleared, setCacheCleared] = useState<boolean>(false);
    const cache = useContextCache();

    function initiate() {
        setCacheCleared(false);
        setToastVisible(true);

        cache?.clear();
        setCacheCleared(true);
    }

    useImperativeHandle(ref, () => ({
        clearCache: () => { initiate(); }
    }));

    return (
        <ToastContainer position="bottom-end">
            {toastVisible &&
                <Toast onClose={() => { setToastVisible(false); }}>
                    <Toast.Header>
                        <DatabaseX/>
                        <strong className="me-auto">&nbsp; Clearing Local Cache</strong>
                    </Toast.Header>
                    <Toast.Body className="d-flex justify-content-center align-items-center">
                        {!cacheCleared && <Loader/>}
                        {cacheCleared && <div className="text-center">Cleared local cache, your next action will pull data from the server.</div>}
                    </Toast.Body>
                </Toast>
            }
        </ToastContainer>
    );
};

export default ClearCache;