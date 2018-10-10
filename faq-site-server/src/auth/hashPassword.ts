import crypto from "crypto";
import {secretKey} from "./jwt-key";
import {Settings} from "../settings";

export const hashPassword = (input: string) => {
    return new Promise<string>((resolve, reject) => {
        crypto.pbkdf2(input, secretKey, Settings.PASSWORDITERATIONS, 64, "sha512", (err: Error | null, derivedKey: Buffer) => {
            if (err !== null) {
                reject();
            }
            resolve(derivedKey.toString("hex"));
        });
    });
};

