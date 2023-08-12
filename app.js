const express = require("express");
const handlebars = require("express-handlebars");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(req.method, req.path);
  next();
});

app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.get("/:ticketId", (req, res) => {
  const { ticketId } = req.params;

  res.render("form", { ticketId });
});

app.post("/postear", async (req, res) => {
  try {
    const {
      ticketId,
      satisfaccionCentral,
      satisfaccionProveedor,
      recomendarServicio,
    } = req.body;
    const ddbb = await fs.promises.readFile(__dirname + "/db/result.json");
    const data = JSON.parse(ddbb);

    const exists = data.find((ticket) => ticket.ticketId === ticketId);
    if (exists) return res.render("error");

    const newTicket = {
      ticketId,
      satisfaccionCentral,
      satisfaccionProveedor,
      recomendarServicio,
    };

    data.push(newTicket);

    await fs.promises.writeFile(
      __dirname + "/db/result.json",
      JSON.stringify(data, null, 2)
    );
    res.render("success");
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.promises.writeFile(
        __dirname + "/db/result.json",
        JSON.stringify([])
      );
    } else {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
