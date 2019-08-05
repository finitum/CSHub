import {Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Topic} from "./topic";
import {User} from "./user";

@Entity({
    name: "studies"
})
export class Study {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "text"
    })
    name: string;

    @OneToOne(type => Topic, topic => topic.study, {
        nullable: false
    })
    @JoinColumn()
    topTopic: Topic;

    @ManyToMany(type => User, user => user.studies)
    @JoinTable()
    admins: User[];

}
