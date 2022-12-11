const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage')
const credentials = require('./credentials.json')

const gcs = new Storage({ keyFilename: './ourpromise-25c45a080fbc.json' });
const serviceAccount = require("./ourpromise-25c45a080fbc.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ourpromise.firebaseio.com"
});
const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// build multiple CRUD interfaces:
app.post('/verify', (req, res) => {
  const { uid, event1, event2 } = req.body
  console.log("operation verify user with uid ", uid, " started");

  res.send(new Promise((resolve, reject) => {
    if (event1 == credentials.event1 && event2 == credentials.event2) {
      const userRef = admin.firestore().collection('users').doc(uid);
      userRef.set({
        verified: true
      }, { merge: true });
      console.log("uid ", uid, "successfully verified");
      resolve(userRef.get());
    } else {
      console.log("uid ", uid, "successfully verified");
      console.log("Failed credentials are ", event1, event2);
      reject("Invalid credentials");
    }
  }));
});

app.post('/committee/registration', (req, res) => {
  console.log("operation submit committe registration form started");
  const { uid } = req.body
  const userRef = admin.firestore().collection('users').doc(uid);
  admin.firestore().collection('committee_registration').add(req.body)
    .then((ref) => {
      res.send(ref)
      userRef.set({
        committee_registration: true
      }, { merge: true });
      console.log("uid ", uid, " has successfully registered as committee");
    })
    .catch((e) => {
      res.status(500).send("Internal problem")
      console.log("uid ", uid, " fail to register as committe");
      console.log("Error Message ", e);
    });
});

app.get('/graduates', (req, res) => {
  console.log("operation get all graduates started");
  let {uid} = req.query;
  if (!uid) {
    uid = 'default';
  }
  admin.firestore().collection('users').doc(uid).get()
    .then((snapshot) => {
      const authenticated = snapshot.exists;
      console.log("fetching data for ", authenticated ? "successfully" : "NOT", "AUTHENTICATED user");
      admin.firestore().collection('graduates').get()
        .then(snapshot => {
          const actions = snapshot.docs.map(doc => new Promise((resolve, reject) => {
              const data = doc.data();
              data.birthday = (data.birthday._seconds + 3600 * 9) * 1000;
              data.id = doc.id;
              const bucket = gcs.bucket("gs://ourpromise.appspot.com/graduates");
              const file = bucket.file(`${data.name}.jpg`);
              file.getSignedUrl({
                action: 'read',
                expires: '03-09-2025'
              })
                .then(signedUrls => {
                  data.image = signedUrls[0]
                  if (!authenticated) {
                    delete data.lecture;
                    delete data.tutorial;
                    delete data.phone;
                    delete data.birthday;
                    delete data.email;
                  }
                  resolve(data);
                })
                .catch(() => reject(`fail to get graduate image url for ${  data.name}`));
            }))
          Promise.all(actions)
            .then(results => res.send(results))
            .catch((e) => {
              res.status(500).send("Internal problem")
              console.log("Error Message ", e);
            });
        })
        .catch((e) => {
          console.log("fail to get graduates info")
          res.status(500).send([]);
          console.log("Error Message ", e);
        })
    })
    .catch(e => {
      console.error("fail to authenticated user with uid ", uid);
      console.log(e)
    });
});

app.get('/graduates/:id', (req, res) => {
  const requestId = req.params.id;
  console.log("operation get graduate with id ", requestId, " started");
  let {uid} = req.query;
  if (!uid) {
    uid = 'default';
  }
  admin.firestore().collection('users').doc(uid).get()
    .then((snapshot) => {
      const authenticated = snapshot.exists;
      console.log("fetching data for ", authenticated ? "successfully" : "NOT", "AUTHENTICATED user");
      admin.firestore().collection('graduates').doc(requestId).get()
        .then(snapshot => {
          const data = snapshot.data();
          data.birthday = (data.birthday._seconds + 3600 * 9) * 1000;
          data.id = requestId;
          const bucket = gcs.bucket("gs://ourpromise.appspot.com/graduates");
          const file = bucket.file(`${data.name}.jpg`);
          file.getSignedUrl({
            action: 'read',
            expires: '03-09-2025'
          })
            .then(signedUrls => {
              data.image = signedUrls[0]
              if (!authenticated) {
                delete data.lecture;
                delete data.tutorial;
                delete data.phone;
                delete data.birthday;
                delete data.email;
              }
              res.send(data);
            })
            .catch((e) => {
              console.log("fail to get graduate image url for ", data.name)
              res.status(500).send("Internal problem")
              console.log("Error Message ", e);
            });
        })
        .catch(e => {
          console.log("fail to get graduates info")
          res.status(500).send("Internal problem");
          console.log("Error Message ", e);
        })
    })
    .catch(e => {
      console.error("fail to authenticated user with uid ", uid);
      console.log(e)
    });
});

app.get('/magazine/chapIntro/:chapId', (req, res) => {
  const {chapId} = req.params;
  console.log("what I got form the url param is ", chapId);
  if (!chapId) {
    chapId = 1;
  }
  console.log("operation get chapIntro ", chapId, " started");
  admin.firestore().collection('magazine_chap_intro').doc(chapId).get()
        .then(snapshot => {
          const data = snapshot.data();
          data.poem = data.poem.map((paragraph) => paragraph.split(", "));
          res.send(data);
        })
        .catch(e => {
          console.log("fail to get chapIntro", chapId," info")
          res.status(500).send("Internal problem");
          console.log("Error Message ", e);
        })
})

app.get('/lecturers', (req, res) => {
  console.log("operation get all lecturers started");
  let {uid} = req.query;
  if (!uid) {
    uid = 'default';
  }
  admin.firestore().collection('users').doc(uid).get()
    .then((snapshot) => {
      const authenticated = snapshot.exists;
      console.log("fetching data for ", authenticated ? "successfully" : "NOT", "AUTHENTICATED user");
      if (!authenticated) {
        res.sendStatus(403);
      } else {
        admin.firestore().collection('lecturers').get()
          .then(snapshot => {
            const actions = snapshot.docs.map(doc => new Promise((resolve, reject) => {
                admin.firestore().collection('lecturers').doc(doc.id).collection('lecturers').get()
                  .then(snapshot => {
                    const actions = snapshot.docs.map(doc => new Promise((resolve, reject) => {
                        const innerData = doc.data();
                        innerData.id = doc.id;
                        const bucket = gcs.bucket("gs://ourpromise.appspot.com/lecturers");
                        const file = bucket.file(`${innerData.name}.jpg`);
                        if (!file) {
                          console.log("image file not found");
                          resolve(innerData);
                        } else {
                          file.getSignedUrl({
                            action: 'read',
                            expires: '03-09-2025'
                          })
                            .then(signedUrls => {
                              innerData.image = signedUrls[0]
                              resolve(innerData);
                            })
                            .catch(() => reject(`fail to get graduate image url for ${  data.name}`));
                        }
                      }))
                    const outerData = doc.data();
                    outerData.id = doc.id;
                    Promise.all(actions)
                      .then(results => {
                        outerData.lecturers = results
                        resolve(outerData);
                      })
                      .catch((e) => {
                        res.status(500).send("Internal problem")
                        console.log("Error Message ", e);
                      });
                  })
              }))
            Promise.all(actions)
              .then(results => res.send(results))
              .catch((e) => {
                res.status(500).send("Internal problem")
                console.log("Error Message ", e);
              });
          })
          .catch((e) => {
            console.log("fail to get graduates info")
            res.status(500).send([]);
            console.log("Error Message ", e);
          })
      }
    })
    .catch(e => {
      console.error("fail to authenticated user with uid ", uid);
      console.log(e)
    });
});

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app);


// app.get('/execute/get', (req, res) => {
//   admin.firestore().collection('lecturers').get()
//     .then(snapshot => {
//       let actions = snapshot.docs.map(doc => {
//         return new Promise((resolve, reject) => {
//           let data = doc.data();
//           data.id = doc.id;
//           resolve(data);
//         })
//       })
//       Promise.all(actions)
//         .then(results => res.send(results))
//         .catch((e) => {
//           res.status(500).send("Internal problem")
//           console.log("Error Message ", e);
//         });
//     })
//     .catch((e) => {
//       console.log("fail to get graduates info")
//       res.status(500).send([]);
//       console.log("Error Message ", e);
//     })
// });

// app.post('/execute/post', (req, res) => {
//   const lectRefId = 5;
//   let counter = 12;
//   const lectRef = admin.firestore().collection('lecturers').doc("" + lectRefId).collection('lecturers')

//   lecturer_data.forEach((lecturer) => {
//     const sign_off = lecturer.sign_off || "";
//     const result = {
//       name_ch: lecturer.name_ch + "师",
//       name: `${lecturer.honorific} ${lecturer.name}`,
//       sign_off: sign_off,
//       message: lecturer.message
//     }
//     lectRef.doc("" + counter).set(result);
//     counter++;
//   });

//   res.status(200);

// });
