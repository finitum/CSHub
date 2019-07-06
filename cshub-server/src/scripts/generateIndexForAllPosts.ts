import {query} from "../db/database-query";
import async from "async";

query(`
SELECT id, htmlContent
FROM edits
WHERE htmlContent IS NOT NULL
`)
    .then((result) => {
        async.each(result.convertRowsToResultObjects(), (item, callback) => {
            const currEditId = item.getNumberFromDB("id");
            const currHtml = item.getStringFromDB("htmlContent");

            const filteredArr: string[] =
                currHtml
                    .toLowerCase()
                    .replace(/<(.+?)>/g, " ") // Remove all HTML tags
                    .replace(/[^a-zA-Z -]/g, " ") // Remove all non letters (but keep streepjes)
                    .replace(/\b[a-zA-Z]{1,3}\b/g, " ") // Remove all words smaller than 3 chars
                    .replace(/\s+/g, "\n") // Replace all whitespace by newlines
                    .split("\n");

            const unique = [...new Set(filteredArr)];
            const htmlFiltered = unique.join("");

            query(`
                UPDATE edits
                SET indexWords = ?
                WHERE id = ?
            `, htmlFiltered, currEditId)
                .then(() => {
                    console.log(`Done with id ${currEditId}`);
                    callback();
                });
        }, () => {
            console.log("Done!");
        });
    });
