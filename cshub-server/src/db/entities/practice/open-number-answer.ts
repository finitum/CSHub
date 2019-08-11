import { ChildEntity, Column } from "typeorm";
import { Exclude } from "class-transformer";
import { Answer } from "./answer";

@Exclude()
@ChildEntity()
export class OpenNumberAnswer extends Answer {
    @Column({
        type: "float"
    })
    openAnswerNumber!: number;

    @Column()
    precision!: number;
}
