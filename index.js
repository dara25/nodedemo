const express = require("express");
const app = express();
const cors = require("cors");

// middlewares
app.use(express.json());
app.use(cors());

// routes
app.get("/", (req, res) => {
  res.json("Hi");
});

app.use("/auth", require("./routes/auth"));

app.use("/api/dashboard", require("./routes/dashboard"));

app.use("/api/employees", require("./routes/employees"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
