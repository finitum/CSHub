import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Answer } from "./answer";

@Entity({
    name: "seed"
})
export class Seed {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(type => Answer, answer => answer.dynamicAnswerSeeds, {
        nullable: false,
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT"
    })
    answer!: Answer;

    @Column({
        nullable: false
    })
    start!: number;

    @Column({
        nullable: false
    })
    end!: number;
}
