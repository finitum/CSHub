import {Request, Response} from "express";

import {app, logger} from "../../";

import {TopicsCallBack, TopicsRequest} from "../../../../cshub-shared/api-calls";
import {getTopicTree} from "../../utilities/topics-utils";

app.get(TopicsRequest.getURL, (req: Request, res: Response) => {

    const topics = getTopicTree();
    topics
        .then((result) => {
            if (result === null) {
                logger.error(`No topics found`);
                res.status(500).send();
            } else {
                res.json(new TopicsCallBack(result));
            }
        });
});
