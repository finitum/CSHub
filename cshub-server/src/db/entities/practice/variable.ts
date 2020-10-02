import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Answer } from "./answer";

@Entity({
    name: "variable",
})
export class Variable {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne((type) => Answer, (answer) => answer.dynamicAnswerVariables, {
        nullable: false,
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT",
    })
    answer!: Answer;

    @Column({
        nullable: false,
    })
    name!: string;

    @Column({
        nullable: false,
    })
    expression!: string;
}
