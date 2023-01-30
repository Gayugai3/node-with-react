const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
//const URL = "mongodb://localhost:27017";
const URL = process.env.db;

const SECRET = process.env.JWT_SECRET_KEY;

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const cors = require("cors");

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
const users = [];

const authorize = (req, res, next) => {
  if (req.headers.authorization) {
    try {
      const verify = jwt.verify(req.headers.authorization, SECRET);
      if (verify) {
        next();
      }
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized/Session Timeout" });
  }
};
app.get(`/users`, authorize, async (req, res) => {
  try {
    // Connect MongoDB
    const connection = await mongoclient.connect(URL);

    //Select database
    const db = connection.db("b40Wd2_tamil");

    //Select collection
    const collection = db.collection("users");

    //Do operations - Insert, Update, Delete and find
    const users = await collection
      .find({
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
      })
      .toArray();

    //close connection
    await connection.close();

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error Fetching users" });
  }
});

app.post(`/user`, authorize, async (req, res) => {
  console.log(req.body);
  //   //   users.push({
  //   //     name: "Arul",
  //   //     age: 2,
  //   //   });
  //   //   req.body.id = users.length + 1;
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   const month = now.getMonth() + 1; //getMonth will start from 0 so add 1
  //   const day = now.getDate();
  //   const hour = now.getHours();
  //   const minute = now.getMinutes();
  //   const second = now.getSeconds();

  //   req.body.id = `${year}${month}${day}${hour}${minute}${second}`;

  //   users.push({
  //     id: req.body.id,
  //     name: req.body.name,
  //     age: req.body.age,
  //   });

  //   res.json("Success");

  try {
    // Connect MongoDB
    const connection = await mongoclient.connect(URL);

    //Select database
    const db = connection.db("b40Wd2_tamil");

    //Select collection
    const collection = db.collection("users");

    //Do operations - Insert, Update, Delete and find
    const operation = await collection.insertOne({
      ...req.body,
      isDeleted: false,
    });

    //close connection
    await connection.close();

    res.json({ message: "user successfully inserted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error inserting user" });
  }
});

app.put("/user/:userid", authorize, async (req, res) => {
  // //to get the url params
  // console.log(req.params.userid);

  // //to get the query params
  // //console.log(req.query.name);

  // const index = users.findIndex((o) => o.id == req.params.userid);
  // //   users[index].age = req.body.age;

  // console.log(Object.keys(req.body));

  // //to seperate keys from the object

  // Object.keys(req.body).forEach((field) => {
  //   users[index][field] = req.body[field];
  // });
  // res.json({ message: "Edited" });

  try {
    // Connect MongoDB
    const connection = await mongoclient.connect(URL);

    //Select database
    const db = connection.db("b40Wd2_tamil");

    //Select collection
    const collection = db.collection("users");

    //Do operations - Insert, Update, Delete and find
    const operation = await collection.findOneAndUpdate(
      {
        _id: mongodb.ObjectId(req.params.userid),
      },
      {
        $set: req.body,
      }
    );
    //close connection
    await connection.close();

    res.json({ message: "user Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error updating user" });
  }
});

app.delete("/user/:userid", authorize, async (req, res) => {
  // const index = users.findIndex((o) => o.id == req.params.userid);
  // users.splice(index, 1);
  // res.json({ message: "Delete" });

  try {
    // Connect MongoDB
    const connection = await mongoclient.connect(URL);

    //Select database
    const db = connection.db("b40Wd2_tamil");

    //Select collection
    const collection = db.collection("users");

    //Do operations - Insert, Update, Delete and find
    const operation = await collection.findOneAndUpdate(
      {
        _id: mongodb.ObjectId(req.params.userid),
      },
      {
        $set: { isDeleted: true },
      }
    );
    //close connection
    await connection.close();

    res.json({ message: "user Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error deleting user" });
  }
});

app.get("/user/:id", authorize, async (req, res) => {
  // const index = users.findIndex((o) => o.id == req.params.id);
  // res.json(users[index]);
  try {
    // Connect MongoDB
    const connection = await mongoclient.connect(URL);

    //Select database
    const db = connection.db("b40Wd2_tamil");

    //Select collection
    const collection = db.collection("users");

    //Do operations - Insert, Update, Delete and find
    const users = await collection.findOne({
      $and: [
        { _id: mongodb.ObjectId(req.params.id) },
        {
          $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
        },
      ],
    });

    //close connection
    await connection.close();

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error Fetching users" });
  }
});

app.post("/register", async (req, res) => {
  try {
    // Connect MongoDB
    const connection = await mongoclient.connect(URL);

    //Select database
    const db = connection.db("b40Wd2_tamil");

    //Select collection
    const collection = db.collection("app_users");

    //so encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    req.body.password = hash;
    //Do operations - Insert, Update, Delete and find
    const users = await collection.insertOne(req.body);

    //close connection
    await connection.close();

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error Fetching users" });
  }
});

app.post("/login", async (req, res) => {
  try {
    // Connect MongoDB
    const connection = await mongoclient.connect(URL);

    //Select database
    const db = connection.db("b40Wd2_tamil");

    //Select collection
    const collection = db.collection("app_users");

    const user = await collection.findOne({ email: req.body.email });

    if (user) {
      const compare = await bcrypt.compare(req.body.password, user.password);
      if (compare) {
        // res.json({ message: "Login successful" });
        const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: 60 });
        console.log(token);

        res.json({ message: "Login successful", token });
      } else {
        res.json({ message: "Email/password mismatch" });
      }
    } else {
      res.status(401).json({ message: "Email/password mismatch" });
    }
    //close connection
    await connection.close();

    // res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(process.env.PORT || 8000);
