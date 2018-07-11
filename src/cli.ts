/* tslint:disable:no-console */

import * as yargs from "yargs";
import Cleaner, { ICleanerOptions } from "./Cleaner";

async function start(cliArgs: any) {
  const cleaner = new Cleaner(cliArgs.argv as ICleanerOptions);
  try {
    const result = await cleaner.start();
    console.log(`Affected rows : ${result.affectedRows}`);
    process.exit(0);
  } catch (err) {
    console.error("ERROR : " + err.message);
    process.exit(1);
  }
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

  .option("limit", {
    default: 50000,
    describe: "Max record deleted",
    number: true,
  })

  .option("debug", {
    boolean: true,
  })

  .option("dry-run", {
    alias: "dryrun",
    boolean: true,
  });

start(args);
