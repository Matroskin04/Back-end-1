import express, {Request, Response} from 'express'
import bodyParser from "body-parser";

const app = express()
const port = 2342

type videoType = {
    "id": number,
    "title": string,
    "author": string,
    "canBeDownloaded": boolean,
    "minAgeRestriction": any,
    "createdAt": string,
    "publicationDate": string,
    "availableResolutions": Array<string>
};
type allVideosType = Array<videoType>;
type errorObjType = { message: string, field: string };
type errorType = { errorsMessages: Array<errorObjType> };

let allVideos: allVideosType = [];
let arrErrors: Array<errorObjType> = [];
let allErrors: errorType = {errorsMessages: arrErrors};
const createdAt = new Date().toISOString();
const publicationDate = new Date(Date.now() + (3600 * 1000 * 24)).toISOString();
const availableResolutions = ['P144', 'P240', 'P360', 'P480',
    'P720', 'P1080', 'P1440', 'P2160']

const parserMiddeleware = bodyParser({})
app.use(parserMiddeleware)

const checkError = (body: any) => {
    if (typeof body.title !== 'string') {
        console.log('title')
        arrErrors.push({
                message: 'The type must be string',
                field: 'title'
            }
        )
    } else if (body.title.length > 40) {
        console.log('title')
        arrErrors.push({
                message: 'The string must be less than 40 characters',
                field: 'title'
            }
        )
    }
    if (typeof body.author !== 'string') {
        console.log('author')
        arrErrors.push({
                message: 'The type must be string',
                field: 'author'
            }
        )
    } else if (body.author.length > 20) {
        console.log('author')
        arrErrors.push({
                    message: 'The string must be less than 20 characters',
                    field: 'author'
                }
        )
    }
    if (!body.availableResolutions.every((p: string) => availableResolutions.includes(p))) {
        console.log('availableResolutions')
        arrErrors.push({
                    message: 'availableResolutions must contain variants from suggested',
                    field: 'availableResolutions'
                }
        )
    }
    if (body.minAgeRestriction?.length > 18 || body.minAgeRestriction?.length < 1) {
        arrErrors.push({
                    message: 'Length must be from 1 to 18 characters',
                    field: 'minAgeRestriction'
                }
        )
    }
}
app.get('/', (req: Request, res: Response) => {
    res.send("Hello!")
})
app.get('/hometask-01/videos', (req: Request, res: Response) => {
    res.status(200).send(allVideos)
})
app.post('/hometask-01/videos', (req: Request, res: Response) => {
    checkError(req.body);
    if (arrErrors.length > 0) {
        res.status(400).send(allErrors);
        arrErrors.length = 0;
        return;
    } else {
        const newVideo: videoType = {
            "id": allVideos.at(-1) ? allVideos[allVideos.length - 1].id + 1 : 0,
            "title": req.body.title,
            "author": req.body.author,
            "canBeDownloaded": req.body.canBeDownloaded ?? false,
            "minAgeRestriction": req.body.minAgeRestriction ?? null,
            "createdAt": createdAt,
            "publicationDate": publicationDate,
            "availableResolutions": req.body.availableResolutions
        };
        allVideos.push(newVideo);
        res.status(201).send(newVideo);
    }
})
app.get('/hometask-01/videos/:id', (req: Request, res: Response) => {
    for (let key of allVideos) {
        if (key.id === +req.params.id) {
            res.status(200).send(key);
            return;
        }
    }
    res.send(404)
})
app.put('/hometask-01/videos/:id', (req: Request, res: Response) => {
    for (let key of allVideos) {
        if (key.id === +req.params.id) {
            checkError(req.body)
            if (arrErrors.length > 0) {
                res.status(400).send(allErrors);
                arrErrors = [];
                return;
            } else {
            key.title = req.body.title ?? key.title;
            key.author = req.body.author ?? key.author;
            key.availableResolutions = req.body.availableResolutions ?? key.availableResolutions;
            key.canBeDownloaded = req.body.canBeDownloaded ?? key.canBeDownloaded;
            key.minAgeRestriction = req.body.minAgeRestriction ?? key.minAgeRestriction;
            key.publicationDate = req.body.publicationDate ?? key.publicationDate;
            res.send(204);
            return;
        }
    }
}
    res.send(404)
})
app.delete('/hometask-01/videos/:id', (req: Request, res: Response) => {
    if (allVideos.length > 0) {
        for (let key of allVideos) {
            if (key.id === +req.params.id) {
                allVideos.splice(key.id, 1);
                res.send(204);
                return;
            }
        }
    }
    res.send(404)
})
app.delete('/hometask-01/testing/all-data', (req: Request, res: Response) => {
    allVideos = [];
    res.send(204)
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})