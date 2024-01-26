const express = require("express");
const { Pool } = require("pg");
const config = require("./admin-config.json");
const { EventEmitter } = require("events");
const {
  generateRandomTicketNumber,
  fieldValidation,
} = require("./commonFunction");

const app = express();
const port = 3000;

// PostgreSQL connection configuration
const pool = new Pool({
  user: "user",
  host: "localhost",
  database: "postgres",
  password: "Welcome1",
  port: 5432,
});
const eventEmitter = new EventEmitter();
app.use(express.json());

// Insert Data into the ticket table and Emit Event
app.post("/tickets/create", async (req, res) => {
  try {
    let mandatoryFields = ["passengerDetails"];
    const validationResult = fieldValidation(mandatoryFields, req.body);
    if (validationResult.status) {
      return res
        .status(400)
        .json({ error: `${validationResult.fields} - Fields are missing` });
    }
    const ticketnumber = generateRandomTicketNumber();
    const status = "Open";
    const { passengerDetails } = req.body;
    passengerDetails.ticketCreationTimeStamp = new Date(); // records ticket creation timeinfo for audit.
    const result = await pool.query(
      "INSERT INTO ticketinfo (ticketnumber, status, passengerDetails) VALUES ($1, $2, $3) RETURNING *",
      [ticketnumber, status, passengerDetails]
    );

    const insertedTicket = result.rows[0];

    // Emit an event about new ticket creation
    if (insertedTicket) {
      eventEmitter.emit("newticketgotcreated", insertedTicket);
      res.status(200).json(insertedTicket);
    } else {
      eventEmitter.emit("failedEvents", new Error("Ticket Creation is failed"));
      return res.status(400).json({ error: "Ticket Creation is failed" });
    }
  } catch (error) {
    console.error("Error inserting ticket:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Listen for the 'ticketInserted' event
eventEmitter.on("newticketgotcreated", (insertedTicket) => {
  console.log(
    `New ticket created. Ticket details: ${JSON.stringify(insertedTicket)}`
  );
});

// Update Ticket Status
app.put("/tickets/updateTicketStatus", async (req, res) => {
  try {
    let mandatoryFields = ["ticketNumber", "status", "passengerDetails"];
    const validationResult = fieldValidation(mandatoryFields, req.body);
    if (validationResult.status) {
      return res
        .status(400)
        .json({ error: `${validationResult.fields} - Fields are missing` });
    }
    const { ticketNumber, status, passengerDetails } = req.body;
    passengerDetails.ticketlastUpdationTimeStamp = new Date(); // records timeinfo about last updated ticket details for audit.
    let booleanvalue = true;
    const result = await pool.query(
      `UPDATE ticketinfo SET status = $1, 
    passengerDetails = jsonb_set(jsonb_set(jsonb_set(jsonb_set(
        jsonb_set(
            jsonb_set(
                jsonb_set(
                    passengerDetails, 
                    '{firstName}', 
                    '"${passengerDetails.firstName}"',
                    ${booleanvalue}
                ),
                '{lastName}', 
                '"${passengerDetails.lastName}"',
                ${booleanvalue}
            ),
            '{emailId}', 
            '"${passengerDetails.emailId}"',
            ${booleanvalue}
        ),
        '{seatNumber}',
        '"${passengerDetails.seatNumber}"',
        ${booleanvalue}
        ),
        '{boardingPoint}',
        '"${passengerDetails.boardingPoint}"',${booleanvalue}
        ),
        '{boardingTime}',
        '"${passengerDetails.boardingTime}"',${booleanvalue}),
        '{ticketlastUpdationTimeStamp}',
        '"${passengerDetails.ticketlastUpdationTimeStamp}"',${booleanvalue}) WHERE ticketnumber = $2 RETURNING *`,
      [status, ticketNumber]
    );
    const updatedTicket = result.rows[0];

    if (updatedTicket) {
      // Trigger an event to notify the ticket update
      eventEmitter.emit("ticketUpdated", updatedTicket);

      res.status(200).json(updatedTicket);
    } else {
      eventEmitter.emit("failedEvents", new Error("Ticket not found"));
      return res.status(400).json({ error: "Ticket not found" });
    }
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Listen for the 'ticketUpdated' event
eventEmitter.on("ticketUpdated", (updatedTicket) => {
  console.log(
    `Ticket ${updatedTicket.ticketnumber} updated. New status: ${updatedTicket.status}`
  );
});

// function to retrieve the current status of a ticket
app.get("/tickets/ticketStatus", async (req, res) => {
  try {
    let mandatoryFields = ["ticketNumber", "email"];
    const validationResult = fieldValidation(mandatoryFields, req.body);
    if (validationResult.status) {
      return res
        .status(400)
        .json({ error: `${validationResult.fields} - Fields are missing` });
    }
    const { ticketNumber, email } = req.body;
    const result = await pool.query(
      "SELECT status FROM ticketinfo WHERE ticketnumber = $1 and passengerDetails ->> 'emailId' = $2",
      [ticketNumber, email]
    );

    if (result.rows.length === 0) {
      eventEmitter.emit("failedEvents", new Error("Ticket not found"));
      return res.status(400).json({ error: "Ticket not found" });
    } else {
      res.status(200).json({
        status: `Current status of the ticket is ${result.rows[0].status}`,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// function to retrieve lists of closed tickets
app.get("/tickets/closed", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ticketinfo WHERE status = $1",
      ["Closed"]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(200).json({ info: "There is no closed tickets" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// function to retrieve lists of open tickets
app.get("/tickets/open", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ticketinfo WHERE status = $1",
      ["Open"]
    );
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(200).json({ info: "There is no open tickets" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// function to retrieve detailed information about the person owning a specific ticket
app.get("/tickets/fetchPassengerInfo", async (req, res) => {
  try {
    let mandatoryFields = ["ticketNumber"];
    const validationResult = fieldValidation(mandatoryFields, req.body);
    if (validationResult.status) {
      return res
        .status(400)
        .json({ error: `${validationResult.fields} - Fields are missing` });
    }
    const { ticketNumber } = req.body;
    const result = await pool.query(
      "SELECT passengerDetails from ticketinfo  WHERE ticketnumber = $1",
      [ticketNumber]
    );
    if (result.rows.length === 0) {
      eventEmitter.emit("failedEvents", new Error("Ticket not found"));
      return res.status(400).json({ error: "Ticket not found" });
    } else {
      res.status(200).json({
        passengerDetails: {
          emailId: result.rows[0].passengerdetails.emailId,
          firstName: result.rows[0].passengerdetails.firstName,
          lastName: result.rows[0].passengerdetails.lastName,
          seatNumber: result.rows[0].passengerdetails.seatNumber,
          boardingTime: result.rows[0].passengerdetails.boardingTime,
          boardingPoint: result.rows[0].passengerdetails.boardingPoint,
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//API for Admin to Reset the Server
app.post("/ticket/reset", async (req, res) => {
  const userEmail = req.headers["useremail"];
  // Check if the logged in user is valid
  if (config.authenicatedUser.includes(userEmail)) {
    try {
      // Update all tickets
      const result = await pool.query(
        "UPDATE ticketinfo SET status = $1 RETURNING *",
        ["Open"]
      );

      const updatedTickets = result.rows;

      // Trigger an event
      eventEmitter.emit("serverReset", updatedTickets);

      return res
        .status(200)
        .json({ message: "Server reset initiated by admin", updatedTickets });
    } catch (error) {
      console.error("Error resetting server:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
});

eventEmitter.on("serverReset", (updatedTickets) => {
  console.log("Server reset initiated. Updated tickets:", updatedTickets);
});

eventEmitter.on("failedEvents", (error) => {
  console.error("Failed:", error.message);
});

// function to delete the table ticketinfo from database
app.delete("/resetTable", async (req, res) => {
  try {
    const result = await pool.query("DROP TABLE ticketInfo;");
    return res
      .status(200)
      .json({ message: "table reset initiated by admin", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
