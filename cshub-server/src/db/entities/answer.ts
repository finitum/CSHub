import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./question";
import { IAnswer } from "../../../../cshub-shared/src/entities/answer";
import { Exclude, Expose } from "class-transformer";

@Exclude()
@Entity({
    name: "answer"
})
export class Answer implements IAnswer {
    @Expose()
    @PrimaryGeneratedColumn()
    id!: number;

    @Expose()
    @ManyToOne(type => Question, question => question.answers, {
        nullable: false
    })
    question!: Question;

    // If multiple choice: has a text + notion if it's correct
    @Expose()
    @Column({
        nullable: true
    })
    closedAnswerText?: string;

    @Column({
        nullable: true
    })
    correct?: boolean;

    // If open (number): has a number + precision
    @Column({
        nullable: true,
        type: "float"
    })
    openAnswerNumber?: number;

    @Column({
        nullable: true
    })
    precision?: number;

    // If open (string): has a correct answer
    @Column({
        nullable: true
    })
    openAnswerText?: string;
}
