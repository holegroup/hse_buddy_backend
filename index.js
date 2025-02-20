require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const schedule = require("node-schedule");

// utils
const { updateTaskStatus, handleRecurringTask } = require("./utils/taskAutoUpdater");

// routes
const userRoutes = require("./routes/userRoutes");
const inspectionFormRoutes = require("./routes/inspectionFormRoutes");
const productRoutes = require("./routes/productRoutes");
const siteRoutes = require("./routes/siteRoute");
const taskRoutes = require("./routes/taskRoutes");
const sseRoutes = require('./routes/sseRoutes'); 

// cors
const cors = require("cors");
const bodyParser = require("body-parser");


app.get("/", (req, res) => {
    res.send("server is running");
});

// middlewares for server
console.log("Here")
app.use(bodyParser.json());
app.use(cors());

// connecting to db
connectDB();

// defining the routes
// user routes
app.use("/api/users", userRoutes);

// inspection form routes
app.use("/api/forms", inspectionFormRoutes);

// product routes
app.use("/api/products", productRoutes);

// site routes
app.use("/api/sites", siteRoutes);

// task routes
app.use("/api/tasks", taskRoutes);

// sse routes
app.use("/api/sse", sseRoutes); 


// job scheduling (update task status)
// schedule.scheduleJob("*/2 * * * *", async () => {
//     updateTaskStatus();
//     handleRecurringTask();
// });
schedule.scheduleJob("0 0 * * *", async () => {
    updateTaskStatus();
    handleRecurringTask();
});

app.get("/testing", (req, res) => {
    res.send("<h1>Hello Subhankar</h1>");
})
app.get("/server", (req, res) => {
    res.send("<h2>This is a testing server HSE Flutter APP with auth log-in and auth reg-in</h2>");
})

app.listen(process.env.PORT, () => {
    console.log(":server is listening in port", process.env.PORT);
})
