const express = require("express");
const fetchuser = require("../middleware/auth");
const router = express.Router();
const Notes = require("../models/Note");
const { body, validationResult } = require("express-validator");

// ROUTE:1 Get All the Notes using :GET "/api/notes/get-all-notes" . Login required
router.get("/get-all-notes", fetchuser, async (req, res) => {
    try {
  const { id } = req.user;
    const notes = await Notes.find({ user: id });
    res.status(200).json({ notes });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

// ROUTE:1 add a new Note using :POST "/api/notes/add-note" . Login required

router.post(
  "/add-note",
  fetchuser,
  [
    body("title", "title must be atleast 5 characters").isLength({
      min: 5,
    }),
    body("description", "description must be at least 8 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
      try {
        const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { title, description, tag } = req.body;
    const {id} = req.user;
      const note = new Notes({
        title,
        description,
        tag,
        user:id
      });
      const saveNote = await note.save();
      res.status(200).json(saveNote);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }
);
