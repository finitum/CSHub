import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationId,
    Tree,
    TreeChildren,
    TreeParent
} from "typeorm";
import { Post } from "./post";
import { Study } from "./study";
import { ITopic } from "../../../../cshub-shared/src/entities/topic";
import { Question } from "./practice/question";
import { Exclude, Expose } from "class-transformer";

@Exclude()
@Entity({
    name: "topics"
})
export class Topic implements ITopic {
    @Expose()
    @PrimaryGeneratedColumn()
    id!: number;

    @Expose()
    @ManyToOne(type => Topic, topic => topic.children, {
        nullable: true,
        onDelete: "RESTRICT",
        onUpdate: "RESTRICT"
    })
    @JoinColumn({ name: "parentid" })
    parent!: Topic | null;

    @RelationId((topic: Topic) => topic.parent)
    parentId!: number | null;

    @Expose()
    @OneToMany(type => Topic, topic => topic.parent)
    children!: Topic[];

    @Expose()
    @Column({
        type: "text"
    })
    name!: string;

    @Expose()
    @Column({
        unique: true
    })
    hash!: number;

    @OneToOne(type => Study, study => study.topTopic, {
        nullable: true
    })
    study?: Study;

    // Not sent to client
    @OneToMany(type => Post, post => post.topic)
    posts?: Post[];

    @OneToMany(type => Question, question => question.topic)
    questions?: Question[];
}
