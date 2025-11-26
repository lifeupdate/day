// === Firebase Init ===
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_BUCKET",
    messagingSenderId: "YOUR_MSG_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// === Save Note ===
document.getElementById("saveBtn").addEventListener("click", async function () {
    let text = document.getElementById("noteInput").value.trim();
    let photo = document.getElementById("photoInput").files[0];
    let voice = document.getElementById("voiceInput").files[0];

    if (text === "") {
        alert("Catatan tidak boleh kosong!");
        return;
    }

    let photoURL = null;
    let voiceURL = null;

    // Upload Foto
    if (photo) {
        let photoRef = storage.ref("photos/" + Date.now() + "_" + photo.name);
        await photoRef.put(photo);
        photoURL = await photoRef.getDownloadURL();
    }

    // Upload Suara
    if (voice) {
        let voiceRef = storage.ref("voices/" + Date.now() + "_" + voice.name);
        await voiceRef.put(voice);
        voiceURL = await voiceRef.getDownloadURL();
    }

    // Simpan ke Firestore
    await db.collection("notes").add({
        text: text,
        photo: photoURL,
        voice: voiceURL,
        createdAt: Date.now()
    });

    document.getElementById("noteInput").value = "";
    document.getElementById("photoInput").value = "";
    document.getElementById("voiceInput").value = "";
});

// === Load Notes Real-Time ===
db.collection("notes")
  .orderBy("createdAt", "desc")
  .onSnapshot(snapshot => {
      const notesList = document.getElementById("notesList");
      notesList.innerHTML = "";

      snapshot.forEach(doc => {
          let note = doc.data();

          let card = document.createElement("div");
          card.className = "note-card";

          let textTag = document.createElement("p");
          textTag.textContent = note.text;
          card.appendChild(textTag);

          if (note.photo) {
              let img = document.createElement("img");
              img.src = note.photo;
              card.appendChild(img);
          }

          if (note.voice) {
              let audio = document.createElement("audio");
              audio.controls = true;
              audio.src = note.voice;
              card.appendChild(audio);
          }

          notesList.appendChild(card);
      });
  });