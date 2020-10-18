import Component, { mixins } from "vue-class-component";
import SCQuestionMixin from "./SCQuestionMixin";
import MCQuestionMixin from "./MCQuestionMixin";
import OTQuestionMixin from "./OTQuestionMixin";
import ONQuestionMixin from "./ONQuestionMixin";
import DNQuestionMixin from "./DNQuestionMixin";

@Component({
    name: QuestionMixin.name,
})
export default class QuestionMixin extends mixins(
    SCQuestionMixin,
    MCQuestionMixin,
    OTQuestionMixin,
    ONQuestionMixin,
    DNQuestionMixin,
) {}
