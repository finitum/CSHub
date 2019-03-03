import {Request, Response} from "express";
import {app} from "..";
import {Settings} from "../settings";
import {Routes} from "../../../cshub-shared/src/Routes";
import {DatabaseResultSet, query} from "../utilities/DatabaseConnection";

app.get("/prerender(/*)?", (req: Request, res: Response) => {
    let param = req.params[0] as string;

    if (param === undefined) {
        param = "/";
    }

    const strings = param.split("/");
    const paramSplit = "/" + strings[1];

    let title = "";

    switch (paramSplit) {
        case Routes.POST:
            if (isNaN(parseInt(strings[2], 10))) {
                title = "Post";
                break;
            } else {
                query(`
                  SELECT firstname, lastname, title, T2.id
                  FROM posts T1
                         INNER JOIN users T2 ON T1.author = T2.id
                  WHERE hash = ?
                `, strings[2])
                    .then((result: DatabaseResultSet) => {
                        const firstname = result.getStringFromDB("firstname");
                        const lastname = result.getStringFromDB("lastname");
                        const title = result.getStringFromDB("title");
                        const userId = result.getNumberFromDB("id");

                        const descriptionMeta: metaType = {
                            property: "og:description",
                            content: `A post by ${firstname} ${lastname}. Join now and start writing!`
                        };
                        const imageMeta: metaType = {
                            property: "og:image",
                            content: `${Settings.APIADDRESS}/profile/${userId}`
                        };
                        const titleMeta: metaType = {property: "og:title", content: `${title} - CSHub`};

                        const metas = [
                            ...getSitename(param),
                            descriptionMeta,
                            imageMeta,
                            titleMeta
                        ];

                        res.send(createHTML(metas));
                        return;
                    });
                return;
            }
        case Routes.TOPIC:
            query(`
              SELECT name
              FROM topics T1
              WHERE hash = ?
            `, strings[2])
                .then((result: DatabaseResultSet) => {
                    const name = result.getStringFromDB("name");

                    const descriptionMeta: metaType = {
                        property: "og:description",
                        content: `A topic on ${name}. Click to see all the related posts!`
                    };
                    const titleMeta: metaType = {property: "og:title", content: `${name} - CSHub`};

                    const metas = [
                        ...getSitenameImage(param),
                        descriptionMeta,
                        titleMeta
                    ];

                    res.send(createHTML(metas));
                    return;
                });
            return;
        case Routes.INDEX:
            title = "Index";
            break;
        case Routes.LOGIN:
            title = "Login";
            break;
        case Routes.POSTCREATE:
            title = "Create post";
            break;
        case Routes.CREATEACCOUNT:
            title = "Create account";
            break;
        case Routes.USERDASHBOARD:
            title = "User";
            break;
        case Routes.ADMINDASHBOARD:
            title = "Admin";
            break;
        case Routes.UNSAVEDPOSTS:
            title = "Unsaved posts";
            break;
        case Routes.SEARCH:
            title = "Search";
            break;
        case Routes.FAVORITES:
            title = "Favorites";
            break;
        case Routes.FORGOTPASSWORD:
            title = "Forgot password";
            break;
    }

    title += " - CSHub";
    res.send(createHTML(getSitenameImageDescription(param, title)));
});

type metaType = {
    property?: string;
    name?: string;
    content: string;
};

const getSitename = (param: string): metaType[] => [
    {property: "og:type", content: "website"},
    {property: "og:url", content: `${Settings.SITEPROTOCOL}://${Settings.SITEADDRESS}${param}`},
    {property: "og:site_name", content: "CSHub"}
];

const getSitenameImage = (param: string): metaType[] => [
    ...getSitename(param),
    {property: "og:image", content: `${Settings.SITEPROTOCOL}://${Settings.SITEADDRESS}/img/icons/favicon-192x192.png`},
];

const joinNowAndHelpCreateThem = "CSHub is a place where everyone can create, view and edit summaries. Join now and help create them!";
const getSitenameImageDescription = (param: string, title: string): metaType[] => [
    ...getSitenameImage(param),
    {property: "og:title", content: title},
    {
        property: "og:description",
        content: joinNowAndHelpCreateThem
    },
    {
        name: "description",
        content: joinNowAndHelpCreateThem
    }
];

const createHTML = (metas: metaType[]) => {

    let metaTags = "";
    for (const meta of metas) {
        let namePropertyString = "";

        if (meta.property !== undefined && meta.property.length > 0) {
            namePropertyString += `property="${meta.property}"`;
        }

        if (meta.name !== undefined && meta.name.length > 0) {
            namePropertyString += `name="${meta.name}"`;
        }

        metaTags += `<meta ${namePropertyString} content="${meta.content}"/>`;
    }

    return `<!DOCTYPE HTML><html lang="en"><head> <meta charset="UTF-8"/>${metaTags}</head><body></body></html>`;
};
