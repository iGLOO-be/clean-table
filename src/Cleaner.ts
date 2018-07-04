
import * as mysql from "mysql";

export interface ICleanerOptions {
  dsn: string;
  table: string;
  timeField?: string;
  timeValue?: string;
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
  private readonly connection: any;

  constructor(options: ICleanerOptions) {
    this.options = options;
    this.connection = mysql.createConnection(options.dsn);
  }

  public start() {
    const query = this.generateQuery();

    this.connection.connect();

    console.log(query);

    this.connection.query(query, (error: any, results: any) => {
      if (error) {
        throw error;
      }
      console.log(results);
    });

    this.connection.end();
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

    return {
      sql: sql.join(" "),
      values,
    };
  }

}
