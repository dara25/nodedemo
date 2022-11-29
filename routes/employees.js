const router = require("express").Router();
const sql = require("mssql");
const sqlServerConfig = require("../dbConfig");

router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(sqlServerConfig);
    const { recordset } = await pool
      .request()
      .query("SELECT * FROM Payroll.Employees;");
    sql.close();
    return res.status(200).json({
      result: recordset,
    });
  } catch (err) {
    console.error(err.message);
    sql.close();
  }
});

router.get("/:Id", (req, res) => {
  const { Id } = req.params;

  try {
    sql
      .connect(sqlServerConfig)
      .then((pool) => {
        return pool
          .request()
          .input("Id", sql.Int, parseInt(Id))
          .query("SELECT * FROM Payroll.Employees WHERE Id = @Id");
      })
      .then((result) => {
        res.status(200).json(result.recordset[0]);
        sql.close();
      });
  } catch (err) {
    console.error(err.message);
    sql.close();
  }

  // using notion
});

module.exports = router;
