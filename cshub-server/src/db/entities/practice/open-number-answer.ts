import { ChildEntity, Column } from "typeorm";
import { Exclude } from "class-transformer";
import { Choice } from "./choice";

@Exclude()
@ChildEntity()
export class OpenNumberAnswer extends Choice {
    @Column({
        type: "float"
    })
    openAnswerNumber!: number;

    @Column()
    precision!: number;

    constructor(openAnswerNumber: number, precision: number) {
        super();
        this.openAnswerNumber = openAnswerNumber;
        this.precision = precision;
    }
}
