 

const express = require("express");
const db = require("./database");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Add student
app.post("/students", (req, res) => {
    const { name, roll_no, branch, phone, parent_phone } = req.body;

    const sql = `INSERT INTO students
    (name, roll_no, branch, phone, parent_phone)
    VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [name, roll_no, branch, phone, parent_phone],
    (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Student added successfully!" });
    });
});

// View students
app.get("/students", (req, res) => {
    db.query("SELECT * FROM students", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// View all rooms
app.get("/rooms", (req, res) => {
    db.query("SELECT * FROM rooms", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

// View all rooms
app.get("/rooms", (req, res) => {
    db.query("SELECT * FROM rooms", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

// View all rooms
app.get("/rooms", (req, res) => {
    db.query("SELECT * FROM rooms", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

// View all rooms
app.get("/rooms", (req, res) => {
    db.query("SELECT * FROM rooms", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});
// View all rooms
app.get("/rooms", (req, res) => {
    db.query("SELECT * FROM rooms", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

// View all rooms
app.get("/rooms", (req, res) => {
    db.query("SELECT * FROM rooms", (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});
app.post("/allocate", (req, res) => {
    const { student_id, room_id } = req.body;

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: err.message });

        db.query(
            "SELECT * FROM rooms WHERE room_id = ? FOR UPDATE",
            [room_id],
            (err, rooms) => {
                if (err || rooms.length === 0) {
                    return db.rollback(() =>
                        res.status(400).json({ error: "Room not found" })
                    );
                }

                const room = rooms[0];

                if (room.occupied >= room.capacity) {
                    return db.rollback(() =>
                        res.status(400).json({ error: "Room is full" })
                    );
                }

                db.query(
                    "SELECT * FROM allocations WHERE student_id = ? AND status = 'Active'",
                    [student_id],
                    (err, existing) => {
                        if (err || existing.length > 0) {
                            return db.rollback(() =>
                                res.status(400).json({
                                    error: "Student already has an active room"
                                })
                            );
                        }

                        db.query(
                            `INSERT INTO allocations
                            (student_id, room_id, allocation_date, status)
                            VALUES (?, ?, CURDATE(), 'Active')`,
                            [student_id, room_id],
                            err => {
                                if (err) {
                                    return db.rollback(() =>
                                        res.status(500).json({ error: err.message })
                                    );
                                }

                                db.query(
                                    `UPDATE rooms SET occupied = occupied + 1,
                                    status = CASE
                                    WHEN occupied + 1 >= capacity THEN 'Full'
                                    ELSE 'Available' END
                                    WHERE room_id = ?`,
                                    [room_id],
                                    err => {
                                        if (err) {
                                            return db.rollback(() =>
                                                res.status(500).json({ error: err.message })
                                            );
                                        }

                                        db.commit(err => {
                                            if (err) {
                                                return db.rollback(() =>
                                                    res.status(500).json({ error: err.message })
                                                );
                                            }

                                            res.json({
                                                message: "Room allocated successfully!"
                                            });
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
});
app.get("/allocations", (req, res) => {
    const sql = "SELECT * FROM allocations ORDER BY allocation_id DESC";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(result);
    });
});
app.post("/vacate", (req, res) => {
    const { student_id } = req.body;

    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: err.message });

        db.query(
            "SELECT * FROM allocations WHERE student_id = ? AND status = 'Active' FOR UPDATE",
            [student_id],
            (err, rows) => {
                if (err || rows.length === 0) {
                    return db.rollback(() =>
                        res.status(400).json({ error: "No active allocation found" })
                    );
                }

                const allocation = rows[0];

                db.query(
                    "UPDATE allocations SET status = 'Vacated', vacate_date = CURDATE() WHERE allocation_id = ?",
                    [allocation.allocation_id],
                    err => {
                        if (err) return db.rollback(() =>
                            res.status(500).json({ error: err.message })
                        );

                        db.query(
                            `UPDATE rooms
                             SET occupied = occupied - 1,
                             status = 'Available'
                             WHERE room_id = ? AND occupied > 0`,
                            [allocation.room_id],
                            err => {
                                if (err) return db.rollback(() =>
                                    res.status(500).json({ error: err.message })
                                );

                                db.commit(err => {
                                    if (err) return db.rollback(() =>
                                        res.status(500).json({ error: err.message })
                                    );

                                    res.json({ message: "Room vacated successfully!" });
                                });
                            }
                        );
                    }
                );
            }
        );
    });
});

app.put("/students/:id", (req, res) => {
    const { name } = req.body;
    const id = req.params.id;

    db.query(
        "UPDATE students SET name = ? WHERE student_id = ?",
        [name, id],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Student updated successfully!"
            });
        }
    );
});
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
