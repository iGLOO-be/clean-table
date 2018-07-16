
import * as mysql from "promise-mysql";
import { $log } from "ts-log-debug";

$log.level = "debug";
$log.name = "Cleaner";

export interface ICleanerOptions {
  dsn: string;
  table: string;
  timeField?: string;
  timeValue?: number;
  timeType?: string;
  filter?: IFilter[];
  limit?: number;
  debug?: boolean;
  dryRun?: boolean;
}

export interface IFilter {
  column: string;
  value: string;
}

export default
class Cleaner {

  private readonly options: ICleanerOptions;

  constructor(options: ICleanerOptions) {
    this.options = options;
    if (this.options.debug) {
      this.debug(options);
    }
  }

  public async start() {
    const query = this.generateQuery();
    this.debug(query);
    const connection = await mysql.createConnection(this.options.dsn);
    let res = await connection.query(query);
    if (Array.isArray(res)) {
      res = res[0];
    }
    this.debug(res);
    connection.end();
    return res;
  }

  private generateQuery() {
    const {
      dryRun,
      table,
      filter,
      timeField,
      timeValue,
      timeType = "datetime",
    } = this.options;
    const sql = [dryRun ? "SELECT count(*) AS 'affectedRows'" : "DELETE"];
    sql.push("FROM ??");
    const values: any[] = [table];

    if (filter || timeField) {
      sql.push("WHERE 1 = 1");

      if (timeField) {
        sql.push("AND ?? <= DATE_ADD(");
        if (timeType === "date") {
          sql.push("DATE(NOW())");
        } else {
          sql.push("NOW()");
        }
        sql.push(", INTERVAL - ? DAY)");
        values.push(timeField);
        values.push(timeValue);
      }

      if (filter) {
        for (const iFilter of filter) {
          sql.push("AND ?? = ?");
          values.push(iFilter.column);
          values.push(iFilter.value);
        }
      }
    }

    if (this.options.limit) {
      sql.push("LIMIT ?");
      values.push(this.options.limit);
    }

    return mysql.format(sql.join(" "), values);
  }

  private debug(data: any) {
    if (this.options.debug) {
      $log.debug(data);
    }
  }

}
