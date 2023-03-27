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


// ROUTE:2 add a new Note using :POST "/api/notes/add-note" . Login required

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
  
  // ROUTE:3 update en existing note using : PUT "/api/notes/update-notes/:id" . Login required
  router.put('/update-note/:id',fetchuser, async(req, res)=> {
    try {
      const {title, description, tag} = req.body;
      const noteId = req.params.id;
      const userId = req.user.id;
      const newNote = {};
      if(title){
        newNote.title = title;
      }
      if(description){
        newNote.description = description;
      }
      if(tag){
        newNote.tag = tag;
      }
      let note = await Notes.findById(noteId);
      if(!note){
        return res.status(404).send("Not Found");
      }
      if(note.user.toString() !== userId){
        return res.status(401).send("Not Allowed");
      }
      note = await Notes.findByIdAndUpdate(noteId, {$set:newNote}, {new:true});
      res.status(200).json({note});
    }catch (error) {
        res.status(500).send("Internal Server Error");
      }
  });

   // ROUTE:3 delete en existing note using : DELETE "/api/notes/delete-notes/:id" . Login required
router.delete('/delete-note/:id', fetchuser, async(req, res) => {
  try {
  const noteId = req.params.id;
  const userId = req.user.id;

  // Find the note to be delete and delete it
  let note = await Notes.findById(noteId);
      if(!note){
        return res.status(404).send("Not Found");
      }
      // Allow deletion only if user owns this Note
      if(note.user.toString() !== userId){
        return res.status(401).send("Not Allowed");
      }
      note = await Notes.findByIdAndDelete(noteId);
      res.status(200).send({"Success":"Note has been deleted ", note:note})
    }catch (error) {
      res.status(500).send("Internal Server Error");
    }
})

  module.exports = router;