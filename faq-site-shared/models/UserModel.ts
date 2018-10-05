export class UserModel {

    private rank: number;
    private name: string;

    constructor(rank: number, name: string) {
        this.name = name;
        this.rank = rank;
    }
}
