
import * as yargs from "yargs";
import Cleaner, { ICleanerOptions } from "./Cleaner";

function start(cliArgs: any) {
  const cleaner = new Cleaner(cliArgs.argv as ICleanerOptions);
  cleaner.start();
}

const args = yargs
  .option("dsn", {
    required: true,
  })
  .option("table", {
    alias: "t",
    describe: "Table name",
    required: true,
  })

  .option("time-field", {
    describe: "Column name",
  })
  .option("time-value", {
    describe: "Number of days",
    number: true,
  })
  .implies("time-field", "time-value")

  .option("filter", {
    array: true,
    describe: "[COLUMN] [VALUE]",
  })
  .coerce("filter", (opt) => {
    const chunk = 2;
    const filters = [];
    for (let i = 0; i < opt.length; i += chunk) {
      filters.push(opt.slice(i, i + chunk));
    }
    return filters.map((filter) => ({ column: filter[0], value: filter[1] }));
  })

  // .option("verbose", {
  //   boolean: true,
  // })

  .option("limit", {
    default: 50000,
    describe: "Max record deleted",
    number: true,
  });

start(args);
