import Vue from "vue";
import moment from "moment";

Vue.filter("formatDate", (value: string): string => {
    return moment(value).format("DD-MM-YYYY, H:mm");
});


Vue.filter("roundNumber", (value: number, decimals: number): number => {
    if (decimals !== null) {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    } else {
        return Math.round(value * 10) / 10;
    }
});
