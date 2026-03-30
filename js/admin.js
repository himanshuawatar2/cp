console.log("Admin JS Loaded");

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAP8ajNwwfAmzHh4sID3FPpMvUOCL31dAY",
  authDomain: "chaudhary-pathshala.firebaseapp.com",
  projectId: "chaudhary-pathshala"
};

// INIT
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();


// LOGIN
function login(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
  .then(()=>{
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadData();
  })
  .catch((error)=>{
    alert(error.message);
  });
}


// ADD RESULT
function addResult(){

  const name = document.getElementById("name").value;
  const rank = document.getElementById("rank").value;
  const type = document.getElementById("type").value;
  const order = document.getElementById("order").value;
  const file = document.getElementById("file").files[0];

  if(!name || !rank || !order){
    alert("Fill all fields");
    return;
  }

  if(file){

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "student_upload");

    fetch("https://api.cloudinary.com/v1_1/dn0jk09b7/image/upload", {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(data => {

      const imageURL = data.secure_url;

      saveToFirestore(imageURL);

    })
    .catch(err=>{
      alert("Upload failed");
      console.log(err);
    });

  } else {
    alert("Please select image");
  }

}


// 🔥 Separate function (clean code)
function saveToFirestore(photoURL){

  const name = document.getElementById("name").value;
  const rank = document.getElementById("rank").value;
  const type = document.getElementById("type").value;
  const order = document.getElementById("order").value;

  if(window.editId){

    db.collection("results").doc(window.editId).update({
      name,
      rank,
      type,
      order: Number(order),
      photo: photoURL
    }).then(()=>{
      alert("Updated!");
      loadData();
      window.editId = null;
    });

  }else{

    db.collection("results").add({
      name,
      rank,
      type,
      order: Number(order),
      photo: photoURL
    }).then(()=>{
      alert("Added!");
      loadData();
    });

  }

}


// LOAD DATA
function loadData(){
  const tableBody = document.getElementById("tableBody");
  if(!tableBody) return;

  tableBody.innerHTML = "";

  db.collection("results").get().then((snapshot)=>{
    snapshot.forEach((doc)=>{
      const data = doc.data();

      const row = document.createElement("tr");

     row.innerHTML = `
<td>${data.order || "-"}</td>

<td>
  <img src="${data.photo || 'https://via.placeholder.com/40'}"
  style="width:40px;height:40px;border-radius:50%;margin-right:8px;">
  ${data.name || "-"}
</td>

<td>${data.rank || "-"}</td>
<td>${data.type || "-"}</td>

<td>
  <button onclick="editData('${doc.id}', '${data.name}', '${data.rank}', '${data.type}', '${data.order}', '${data.photo}')">Edit</button>
  <button onclick="deleteData('${doc.id}')">Delete</button>
</td>
`;

      tableBody.appendChild(row);
    });
  });
}


// DELETE
function deleteData(id){
  db.collection("results").doc(id).delete().then(()=>{
    alert("Deleted");
    loadData();
  });
}

function editData(id, name, rank, type, order, photo){

  document.getElementById("name").value = name;
  document.getElementById("rank").value = rank;
  document.getElementById("type").value = type;
  document.getElementById("order").value = order;
  document.getElementById("photo").value = photo; // 🔥 IMPORTANT

  window.editId = id;
}

function addNotice(){

  const text = document.getElementById("noticeText").value;

  if(text === ""){
    alert("Enter notice");
    return;
  }

  db.collection("notices").add({
    text: text,
    time: Date.now()
  })
  .then(()=>{
    alert("Notice Added");
    document.getElementById("noticeText").value = "";
  });

}
