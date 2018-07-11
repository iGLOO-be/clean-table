
import * as mysql from "promise-mysql";

export interface ICleanerOptions {
  dsn: string;
  table: string;
  timeField?: string;
  timeValue?: number;
  filter?: IFilter[];
  verbose?: boolean;
  limit?: number;
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
  }

  public async start() {
    const query = this.generateQuery();
    const connection = await mysql.createConnection(this.options.dsn);
    const res = await connection.query(query);
    connection.end();
    return res;
  }

  private generateQuery() {
    const sql = ["DELETE FROM ??"];
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

}
