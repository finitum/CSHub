import ua from "universal-analytics"; // https://github.com/peaksandpies/universal-analytics

const tracker = ua("UA-128424047-1");

tracker.set("ds", "app"); // Allows filtering by the 'Application?' field in GA

export default tracker;
