const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchUser')
const Note = require('../model/Note');
const { body, validationResult } = require('express-validator');

//ROUTE 1: Get all the notes using : Get "/api/notes/getuser"  login reqired
router.get('/fetchAllNotes', fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server error");
    }
})
//ROUTE 2: Get lo using : Post "/api/notes/getuser" No login reqired
router.post('/addNote', fetchUser, [
    body('title', 'Enter correct title').isLength({ min: 3 }),
    body('description', 'Minimum Length of description is 5').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        //If there are errors,return bad request and the error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server error");
    }
})

//ROUTE 3: Update an existing Note using : Post "/api/notes/updatenote" No login reqired
router.post('/updatenote/:id', fetchUser, async (req, res) => {
    const {title,description,tag} = req.body;
    try {
        
    
    //Create newNote Object
    const newNote = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};

    //Find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if(!note){res.status(404).send("Not Found")}

    if(note.user.toString() !==req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    res.json({note})
} catch (error) {
    console.log(error.message)
    res.status(500).send("Internal server error");
}
})

//ROUTE 4: Delete an existing Note using : Post "/api/notes/deletenote" No login reqired
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
   try {
    //Find the note to be deleted and delete it
    let note = await Note.findById(req.params.id);  
    if(!note){res.status(404).send("Not Found")}

    //Allow deletion only if user owns this Note
    if(note.user.toString() !==req.user.id){
        return res.status(401).send("Not Allowed")
    }
    note = await Note.findByIdAndDelete(req.params.id)
    res.json({"Sucess":"Note has been deleted", note: note});
} catch (error) {
    console.log(error.message)
    res.status(500).send("Internal server error");
}
})
module.exports = router