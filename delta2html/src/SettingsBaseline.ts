export interface ISettings {
    PORT: number,
}

export const Settings: ISettings = {
    PORT: process.env.PORT ? Number(process.env.PORT) : 3030
};
