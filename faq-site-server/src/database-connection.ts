import mysql from 'mysql';
import {Settings} from './settings';

const connectionconf = {
    host: Settings.DATABASE.HOST,
    user: Settings.DATABASE.USER,
    password: Settings.DATABASE.PASSWORD,
    database: Settings.DATABASE.NAME,
    multipleStatements: true
};

const connection = mysql.createConnection(connectionconf);

export const query = (query: string, ...args: any[]) =>
    new Promise<any>((resolve, reject) => {
        connection.query(query, args, (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
