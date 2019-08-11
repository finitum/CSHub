import {Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Topic} from "./topic";
import {User} from "./user";
import {Answer} from "./answer";
import {IQuestion} from "../../../../cshub-shared/src/entities/question";

export enum QuestionType {
    CLOSED, OPENNUMBER, OPENTEXT
}

@Entity({
    name: "question"
})
export class Question implements IQuestion {

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(type => Topic, topic => topic.questions, {
        nullable: false
    })
    topic!: Topic;

    @Column({
        type: "text"
    })
    question!: string;

    @Column()
    questionType!: QuestionType;

    @Column({
        default: false
    })
    active!: boolean;

    // If:
    // - multiple choice: has a list of answers (multiple can be correct)
    // - open (number): has only a single answer, which will be checked
    // - open (string): has only a single answer, which won't be checked
    @OneToMany(type => Answer, answer => answer.question)
    answers!: Answer[];

    // not the nicest solution, but it works. This marks which question will be set to inactive if this question is accepted
    @OneToOne(type => Question, question => question.id, {
        nullable: true
    })
    replacesQuestion?: Question;

    // Just for statistics
    @ManyToOne(type => User, user => user.approvedQuestions, {
        nullable: true
    })
    approvedBy?: User;

}
