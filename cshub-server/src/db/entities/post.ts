import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Topic } from "./topic";
import { User } from "./user";
import { IPost } from "../../../../cshub-shared/src/entities/post";

@Entity({
    name: "posts"
})
export class Post implements IPost {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(type => Topic, topic => topic.posts, {
        nullable: false
    })
    @JoinColumn({ name: "topic" })
    @Index()
    topic!: Topic;

    @Column({
        type: "datetime",
        default: () => "CURRENT_TIMESTAMP"
    })
    datetime!: Date;

    @Column({
        type: "varchar",
        length: 127,
        unique: true
    })
    title!: string;

    @Column({
        unique: true
    })
    hash!: number;

    @Column()
    @Index()
    postVersion!: number;

    @Column({
        type: "int", // Otherwise it overrides the value
        default: false
    })
    @Index()
    deleted!: boolean;

    @Column({
        type: "int", // Otherwise it overrides the value
        default: true
    })
    @Index()
    wip!: boolean;

    @Column({
        type: "int", // Otherwise it overrides the value
        default: false
    })
    @Index()
    isIndex!: boolean;
a}
