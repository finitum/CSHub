import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationId
} from "typeorm";
import { Topic } from "./topic";
import { User } from "./user";
import { IStudy } from "../../../../cshub-shared/src/entities/study";
import { Exclude, Expose } from "class-transformer";

@Exclude()
@Entity({
    name: "studies"
})
export class Study implements IStudy {
    @Expose()
    @PrimaryGeneratedColumn()
    id!: number;

    @Expose()
    @Column({
        type: "text"
    })
    name!: string;

    @Expose()
    @OneToOne(type => Topic, topic => topic.study, {
        nullable: false
    })
    @JoinColumn()
    topTopic!: Topic;

    @RelationId((study: Study) => study.topTopic)
    topTopicId!: number;

    // Not sent to client
    @ManyToMany(type => User, user => user.studies)
    @JoinTable()
    admins?: User[];
}
