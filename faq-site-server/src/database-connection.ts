import mysql from 'mysql2';
import {Settings} from './settings';
import {Client} from 'ssh2';
import fs from 'fs';

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
        sshClient.on('ready', () => {
            sshClient.forwardOut(
                '127.0.0.1',
                12345,
                'localhost',
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
                });
        }).connect({
            host: Settings.SSH.HOST,
            port: Settings.SSH.PORT,
            username: Settings.SSH.USER,
            privateKey: fs.readFileSync(Settings.SSH.PRIVATEKEYLOCATION)
        });

    });
}

const toExecuteQueries: {
    query: string,
    resolve: any,
    args: any[]
}[] = [];

connectionPromise.then((connection: any) => {
    if (toExecuteQueries.length > 0) {
        for (const queryobj of toExecuteQueries) {
            query(queryobj.query, queryobj.args).then((data: any) => {
                queryobj.resolve(data);
            });
        }
    }
});

export const query = (query: string, ...args: any[]) =>
    new Promise<any>((resolve, reject) => {

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
                resolve(rows);
            });
        }
    });


export const getStringFromDB = (name: string, obj: any): string => {

    if (Array.isArray(obj)) {
        obj = obj[0];
    }

    const currObj = obj[name];

    try {
        return currObj as string;
    } catch (err) {
        console.error(`Error getting value from database string, name: ${name}. Error: ${err}`);
        return null;
    }
};

export const getNumberFromDB = (name: string, obj: any): number => {

    if (Array.isArray(obj)) {
        obj = obj[0];
    }

    const currObj = obj[name];

    try {
        return currObj as number;
    } catch (err) {
        console.error(`Error getting value from database number, name: ${name}. Error: ${err}`);
        return null;
    }
};
