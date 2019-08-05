import {Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {User} from "./user";
import {Edit} from "./edit";

@Entity({
    name: "editusers"
})
@Unique("UQ_EDIT_USER", ["user", "edit"])
export class EditUser {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => Edit, edit => edit.editusers, {
        nullable: false
    })
    @JoinColumn({name: "edit"})
    edit: Edit;

    @ManyToOne(type => User, user => user.edits, {
        nullable: false
    })
    @JoinColumn({name: "user"})
    user: User;
}
