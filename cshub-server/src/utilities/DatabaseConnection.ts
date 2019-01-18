import mysql from "mysql2";
import {Settings} from "../settings";
import {Client} from "ssh2";
import fs from "fs";
import logger from "./Logger";

const connectionconf = {
    host: Settings.DATABASE.HOST,
    user: Settings.DATABASE.USER,
    password: Settings.DATABASE.PASSWORD,
    database: Settings.DATABASE.NAME,
    multipleStatements: true
};

const sshClient = new Client();

let connection = null;

let connectionPromise = null;
if (Settings.USESSH) {
     connectionPromise = new Promise((resolve, reject) => {
        sshClient.on("ready", () => {
            sshClient.forwardOut(
                "127.0.0.1",
                12345,
                "localhost",
                3306,
                (err, stream) => {
                    if (err) {
                        throw err;
                    }

                    const currConnection = mysql.createConnection({
                        ...connectionconf,
                        stream
                    });

                    connection = currConnection;

                    currConnection.connect(err => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(currConnection);
                        }
                    });

                    connectionPromise.then((connection: any) => {
                        if (toExecuteQueries.length > 0) {
                            for (const queryobj of toExecuteQueries) {
                                query(queryobj.query, ...queryobj.args).then((data: any) => {
                                    queryobj.resolve(data);
                                });
                            }
                        }
                    });
                });
        }).connect({
            host: Settings.SSH.HOST,
            port: Settings.SSH.PORT,
            username: Settings.SSH.USER,
            privateKey: fs.readFileSync(Settings.SSH.PRIVATEKEYLOCATION)
        });

    });
} else {
    connection = mysql.createConnection({
        ...connectionconf
    });
}

const toExecuteQueries: {
    query: string,
    resolve: any,
    args: any[]
}[] = [];

export const query = (query: string, ...args: any[]) => {
    return new Promise<DatabaseResultSet>((resolve, reject) => {

        if (connection == null && Settings.USESSH) {
            toExecuteQueries.push({
                query,
                resolve,
                args
            });
        } else {
            connection.query(query, args, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(new DatabaseResultSet(rows, rows.insertId));
            });
        }
    });
};

export class DatabaseResultSet implements Iterable<DatabaseResultRow> {

    constructor(private rows: any[], private insertId: number) {}

    public static getStringFromDB(name: string, obj: any): string {

        if (Array.isArray(obj)) {
            obj = obj[0];
        }

        const currObj = obj[name.trim()];

        try {
            return currObj as string;
        } catch (err) {
            return null;
        }
    }

    public static getNumberFromDB(name: string, obj: any): number {

        if (Array.isArray(obj)) {
            obj = obj[0];
        }

        const currObj = obj[name.trim()];

        try {
            return currObj as number;
        } catch (err) {
            return null;
        }
    }

    public getInsertId(): number {
        return this.insertId;
    }

    public getLength(): number {
        return this.rows.length;
    }

    public getStringFromDB(name: string, index: number = 0): string {
        return DatabaseResultSet.getStringFromDB(name, this.rows[index]);
    }

    public getNumberFromDB(name: string, index: number = 0): number {
        return DatabaseResultSet.getNumberFromDB(name, this.rows[index]);
    }

    public getRows(): any[] {
        return this.rows;
    }

    public convertRowsToResultObjects(): DatabaseResultRow[] {

        const convertedRows: DatabaseResultRow[] = [];

        for (const row of this.rows) {
            convertedRows.push(new DatabaseResultRow(row));
        }

        return convertedRows;
    }

    [Symbol.iterator](): Iterator<DatabaseResultRow> {

        const rows = this.rows;

        let index = 0;

        return {
            next(value?: any): IteratorResult<DatabaseResultRow> {
                return {
                    done: !(index < rows.length),
                    value: new DatabaseResultRow(rows[index++])
                };
            }
        };
    }
}

export class DatabaseResultRow {

    constructor(private row: any) {}

    public getStringFromDB(name: string): string {
        return DatabaseResultSet.getStringFromDB(name, this.row);
    }

    public getNumberFromDB(name: string): number {
        return DatabaseResultSet.getNumberFromDB(name, this.row);
    }
}
