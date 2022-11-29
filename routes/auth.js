const router = require("express").Router();
const bcrypt = require("bcrypt");
const sql = require("mssql");
const sqlServerConfig = require("../dbConfig");
const jwtGenerator = require("../utils/jwtGenerator");
const authorization = require("../middleware/authorization");

// register user (aka create user)
router.post("/register", async (req, res) => {
  // 1. destructure the req.body
  const { username, password, displayName, email } = req.body;

  try {
    // 2. check if user exist
    const pool = await sql.connect(sqlServerConfig);
    const { recordset } = await pool
      .request()
      .input("Username", sql.VarChar(100), username)
      .query("SELECT * FROM Payroll.MegaUsers WHERE Username = @Username");

    if (recordset.length !== 0) {
      sql.close();
      return res.status(401).send("User already exist");
      //   401 មានន័យថា Unauthenticated
      //   403 មានន័យថា Unauthorized
    }

    // 3. Bcrypt the password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);

    const bcryptPassword = await bcrypt.hash(password, salt);

    // 4. insert new User to the database
    const newUser = await pool
      .request()
      .input("Username", sql.VarChar(100), username)
      .input("Password", sql.VarChar(100), bcryptPassword)
      .input("DisplayName", sql.VarChar(50), displayName)
      .input("Email", sql.VarChar(100), email)
      //   .query(
      //     "INSERT INTO Payroll.MegaUsers (Username, Password, DisplayName, Email) OUTPUT INSERTED.* VALUES (@Username, @Password, @DisplayName, @Email)"
      .query(
        "INSERT INTO Payroll.MegaUsers (Username, Password, DisplayName, Email) OUTPUT INSERTED.UserId VALUES (@Username, @Password, @DisplayName, @Email)"
      );

    // 5. generate jwt token
    const { UserId } = newUser.recordset[0];
    const token = jwtGenerator(UserId);

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    sql.close();
  }
});

// login user
router.post("/login", async (req, res) => {
  // 1. Destructure the req.body
  const { username, password: userPass } = req.body;

  try {
    // 2. Check if user exist, if NOT then throw error
    const pool = await sql.connect(sqlServerConfig);
    const { recordset: users } = await pool
      .request()
      .input("Username", sql.VarChar(100), username)
      .query(
        "SELECT UserId, [Password] FROM Payroll.MegaUsers WHERE Username = @Username"
      );

    sql.close(); // close connection as soon as possible

    if (users.length === 0) return res.status(401).json("User is NOT exist");

    // 3. Validate user's password with password in database
    const { Password } = users[0];
    const passwordValid = await bcrypt.compare(userPass, Password);
    if (!passwordValid) return res.status(401).json("Password is NOT correct");

    // 4. Give jwt token to client
    const { UserId } = users[0];
    const token = jwtGenerator(UserId);

    res.json({ token });
  } catch (err) {
    console.error(err.message);
  }
});

router.get("/is-token-verify", async (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.err(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
