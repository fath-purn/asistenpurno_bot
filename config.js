const admin = require("firebase-admin");

// ========================== Firebase ==========================
const serviceAccount = require("./asistenpurno-bot-firebase-adminsdk-5x8xu-912c2e52bf.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const Note = db.collection('Notes');
module.exports = Note;


// ========================== Firebase ==========================
// Jika ingin digunakan copas ke app.js

// app.get('/', async (req, res) => {
//     const snapshot = await Note.get();
//     const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     res.send(data);
// });


// app.post("/create", async (req, res) => {
//     const data = req.body;
//     await Note.add(data);
//     res.send({ msg: "User added" });
// });


// app.post("/update", async (req, res) => {
//     const id = req.body.id;
//     delete req.body.id;
//     const data = req.body;
//     await User.doc(id).update(data);
//     res.send({msg:"User updated"});
// });

// app.post("/update", async (req, res) => {
//     const id = req.body.id;
//     delete req.body.id;
//     await Note.doc(id).delete();
//     res.send({ msg: "Deleted" });
// });