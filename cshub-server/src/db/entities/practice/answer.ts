import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Question } from "./question";

import { Exclude, Expose } from "class-transformer";
import { ClosedAnswer } from "./closed-answer";
import { OpenTextAnswer } from "./open-text-answer";
import { OpenNumberAnswer } from "./open-number-answer";
import { Seed } from "./seed";
import { DynamicAnswer } from "./dynamic-answer";

@Exclude()
@Entity({
    name: "answer"
})
export class Answer {
    @Expose()
    @PrimaryGeneratedColumn()
    id!: number;

    @Expose()
    @ManyToOne(type => Question, question => question.answers, {
        nullable: false
    })
    question!: Question;

    @RelationId((answer: Answer) => answer.question)
    questionId!: number;

    // Closed answer
    @Column({
        nullable: true
    })
    closedAnswerText?: string;

    @Column({
        nullable: true
    })
    correct?: boolean;

    // Open number
    @Column({
        type: "float",
        nullable: true
    })
    openAnswerNumber?: number;

    @Column({
        type: "float",
        nullable: true
    })
    precision?: number;

    // Open text
    @Column({
        nullable: true
    })
    openAnswerText?: string;

    // Dynamic
    @Column({
        nullable: true
    })
    dynamicAnswerExpression?: string;

    @OneToMany(type => Seed, seed => seed.answer)
    dynamicAnswerSeeds?: Seed[];

    public isClosedAnswer(): this is ClosedAnswer {
        return (
            this.closedAnswerText !== null &&
            this.closedAnswerText !== undefined &&
            this.correct !== null &&
            this.correct !== undefined
        );
    }

    public isOpenTextAnswer(): this is OpenTextAnswer {
        return this.openAnswerText !== null && this.openAnswerText !== undefined;
    }

    public isOpenNumberAnswer(): this is OpenNumberAnswer {
        return (
            this.openAnswerNumber !== null &&
            this.openAnswerNumber !== undefined &&
            this.precision !== null &&
            this.precision !== undefined
        );
    }

    public isDynamicAnswer(): this is DynamicAnswer {
        return this.dynamicAnswerExpression !== null && this.dynamicAnswerExpression !== undefined;
    }
}
