import app from "./app/app.js";
import connectDB from "./config/db.js";

try {
  await connectDB();
} catch (error) {
  console.log("error in connecting db ", error);
  process.exit(1);
}

app
  .listen(3000, "127.0.0.1", () => {
    console.log("server is listening on the port 3000");
  })
  .on("error", (err) => {
    console.log("error in server ", err);
  });
