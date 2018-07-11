
import * as mysql from "promise-mysql";
import { $log } from "ts-log-debug";

$log.level = "debug";
$log.name = "Cleaner";

export interface ICleanerOptions {
  dsn: string;
  table: string;
  timeField?: string;
  timeValue?: number;
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
    const sql = [this.options.dryRun ? "SELECT count(*) AS 'affectedRows'" : "DELETE"];
    sql.push("FROM ??");
    const values: any[] = [this.options.table];

    if (this.options.filter || this.options.timeField) {
      sql.push("WHERE 1 = 1");

      if (this.options.timeField) {
        sql.push("AND ?? <= DATE_ADD(DATE(NOW()), INTERVAL - ? DAY)");
        values.push(this.options.timeField);
        values.push(this.options.timeValue);
      }

      if (this.options.filter) {
        for (const filter of this.options.filter) {
          sql.push("AND ?? = ?");
          values.push(filter.column);
          values.push(filter.value);
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
