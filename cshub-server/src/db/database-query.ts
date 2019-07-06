import logger from "../utilities/Logger";
import {Connection, getConnection} from "typeorm";
import {ConnectionNotFoundError} from "typeorm/error/ConnectionNotFoundError";

const getCurrentConnection = (): Connection => {
    try {
        return getConnection();
    } catch (err) {
        if (err instanceof ConnectionNotFoundError) {
            return null;
        } else {
            throw err;
        }
    }
};

const toExecuteQueries: {
    query: string,
    resolve: any,
    args: any[]
}[] = [];

export const query = (query: string, ...args: any[]) => {
    return new Promise<DatabaseResultSet>((resolve, reject) => {

        if ((query.match(/\?/g) || []).length !== args.length) {
            reject("Amount of arguments mismatch");
        } else if (getCurrentConnection() == null) {
            toExecuteQueries.push({
                query,
                resolve,
                args
            });
        } else if (toExecuteQueries.length > 0) {
            for (const queryobj of toExecuteQueries) {
                getCurrentConnection()
                    .query(queryobj.query, ...queryobj.args)
                    .then((data: any) => {
                        queryobj.resolve(data);
                    });
            }
        } else {
            getCurrentConnection()
                .query(query, args)
                .then(value => {
                    resolve(new DatabaseResultSet(value, value.insertId));
                })
                .catch(reason => {
                    logger.error(reason);
                });
        }
    });
};

export class DatabaseResultSet implements Iterable<DatabaseResultRow> {

    constructor(private rows: any[], private insertId: number) {}

    private static getAnyFromDB(name: string, obj: any): any {
        if (Array.isArray(obj)) {
            obj = obj[0];
        }

        const currObj = obj[name.trim()];

        try {
            return currObj;
        } catch (err) {
            return null;
        }
    }

    public static getStringFromDB(name: string, obj: any): string {

        return this.getAnyFromDB(name, obj) as string;
    }

    public static getBlobFromDB(name: string, obj: any): Buffer {

        return this.getAnyFromDB(name, obj) as Buffer;
    }

    public static getNumberFromDB(name: string, obj: any): number {

        return this.getAnyFromDB(name, obj) as number;
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

    public getBlobFromDB(name: string, index: number = 0): Buffer {
        return DatabaseResultSet.getBlobFromDB(name, this.rows[index]);
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
