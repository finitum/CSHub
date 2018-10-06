import {Request, Response} from 'express';

import {app} from './';
import {validateAccessToken} from './auth/jwt';
import {Settings} from './settings';

app.use((req: Request, res: Response, next: Function) => {

    if (req.cookies !== null && req.cookies['token'] !== null) {
        if (validateAccessToken(req.cookies.token)) {
           res.cookie('token', req.cookies.token, {
               maxAge: 7200
           });
        } else {
            res.clearCookie('token');
        }
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', Settings.ALLOWORIGIN);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');

    next();
});
