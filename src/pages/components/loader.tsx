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
import type {FC} from "react";
import Spinner from 'react-bootstrap/Spinner';

const Loader:FC = () => {
    return (
        <>
            <div className="container-fluid d-flex justify-content-center text-center">
                <Spinner animation="border" role="status" variant="secondary">
                    <span className="sr-only visually-hidden">Loading...</span>
                </Spinner>
            </div>
        </>
    );
}

export default Loader;