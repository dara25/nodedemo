const router = require("express").Router();
const sql = require("mssql");
const sqlServerConfig = require("../dbConfig");
const authorization = require("../middleware/authorization");

router.get("/", authorization, async (req, res) => {
  //   console.log(req.user);
  try {
    //   get username
    const pool = await sql.connect(sqlServerConfig);
    const { recordset: users } = await pool
      .request()
      .input("UserId", sql.UniqueIdentifier, req.user)
      .query("SELECT Username FROM Payroll.MegaUsers WHERE UserId = @UserId");

    sql.close(); // close the connection as soon as possible

    // return username to client
    const { Username } = users[0];
    res.json(Username);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
