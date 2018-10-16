import Vue from "vue";
import moment from "moment";

Vue.filter("formatDate", (value: string): string => {
    return moment(value).format("DD-MM-YYYY, H:mm");
});


Vue.filter("roundNumber", (value: number, decimals: number): string => {
    if (decimals !== null) {
        return value.toFixed(decimals);
    } else {
        return value.toFixed(2);
    }
});
