
import * as moment from "moment";
import * as mysql from "promise-mysql";
import Cleaner from "./Cleaner";

const mysqlConnectionOptions = { user: "root", database: "cleaner-log-test" };
const connectionOptions = {
  dsn: "mysql://root@localhost:3306/cleaner-log-test",
  table: "logs",
};

const prepareDB = async () => {
  const connection = await mysql.createConnection(mysqlConnectionOptions);
  await connection.query("DROP TABLE IF EXISTS `logs`");
  await connection.query(`
    CREATE TABLE \`logs\` (
      \`id\` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
      \`creation\` datetime(0) NULL,
      \`status\` varchar(50) NULL,
      PRIMARY KEY(\`id\`)
    );
  `);
  const records = [
    [moment().subtract(1, "day").format("YYYY-MM-DD HH:mm:ss"), "200"],
    [moment().subtract(2, "day").format("YYYY-MM-DD HH:mm:ss"), "200"],
    [moment().subtract(2, "day").format("YYYY-MM-DD HH:mm:ss"), "408"],
    [moment().subtract(3, "day").format("YYYY-MM-DD HH:mm:ss"), "200"],
    [moment().subtract(4, "day").format("YYYY-MM-DD HH:mm:ss"), "200"],
    [moment().subtract(4, "day").format("YYYY-MM-DD HH:mm:ss"), "500"],
  ];
  for (const values of records) {
    await connection.query("INSERT INTO `logs` SET ?", { creation: values[0], status: values[1] });
  }
  connection.end();
};

beforeEach(() => prepareDB());

test("Should filter on time (date)", async () => {
  const cleaner = new Cleaner({
    ...connectionOptions,
    timeField: "creation",
    timeType: "date",
    timeValue: 3,
  });
  const result = await cleaner.start();
  expect(result.affectedRows).toBe(2);
});

test("Should filter on time (datetime)", async () => {
  const cleaner = new Cleaner({
    ...connectionOptions,
    timeField: "creation",
    timeType: "datetime",
    timeValue: 3,
  });
  const result = await cleaner.start();
  expect(result.affectedRows).toBe(3);
});

test("Should filter on field", async () => {
  const cleaner = new Cleaner({
    ...connectionOptions,
    filter: [{
      column: "status",
      value: "200",
    }],
  });
  const result = await cleaner.start();
  expect(result.affectedRows).toBe(4);
});

test("Should limit the number of records", async () => {
  const cleaner = new Cleaner({
    ...connectionOptions,
    limit: 3,
  });
  const result = await cleaner.start();
  expect(result.affectedRows).toBe(3);
});

test("Should filter on time and field", async () => {
  const cleaner = new Cleaner({
    ...connectionOptions,
    filter: [{
      column: "status",
      value: "500",
    }],
    timeField: "creation",
    timeValue: 2,
  });
  const result = await cleaner.start();
  expect(result.affectedRows).toBe(1);
});

test("Should not delete rows", async () => {
  const cleaner = new Cleaner({
    ...connectionOptions,
    dryRun: true,
  });
  const connection = await mysql.createConnection(mysqlConnectionOptions);
  const [{ nb }] = await connection.query("SELECT count(*) AS nb FROM logs");
  const result = await cleaner.start();
  expect(result.affectedRows).toBeGreaterThan(0);
  const [{ nb: nbAfter }] = await connection.query("SELECT count(*) AS nb FROM logs");
  connection.end();
  expect(nb).toBe(nbAfter);
});
