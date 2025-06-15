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
import Card from "react-bootstrap/Card";
import {CardBody, CardHeader, Container} from "react-bootstrap";
import {Link} from "react-router-dom";
import {ExclamationTriangle} from "react-bootstrap-icons";

const NoPage :FC = () => {
    return (
        <>
            <Container fluid={true} className="d-flex justify-content-center py-4 px-3 mx-auto">
                <Card border="danger" style={{width: "80%"}}>
                    <CardHeader className="bg-danger text-white">
                        <div className="fs-5">
                            <span className="fw-bold me-auto">404 : Bad Link</span>
                            <span className="float-end"><ExclamationTriangle/></span>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="text-danger text-center">
                            We seem to have reached a page / link that either never existed or no longer exists.
                            <br /><br />
                            Shout at the person who sent you this link (perhaps update your bookmarks?) and start over
                            from the <Link to="/">home page</Link> of the site.
                        </div>
                    </CardBody>
                </Card>
            </Container>
        </>
    )
};

export default NoPage;