const express = require("express");
const bodyParser = require("body-parser");
const app = express();
// requre mongoose for mongodb
const mongoose = require("mongoose");

// because we didn't use npm to install the date
// we have to include our "local directory" and  "/" to locate the date.js
// const date = require(__dirname + "/date.js");

// setup connection to mongodb, using database name: "todolistDB"
// instead of using localhost, replaced the string before "/todolist" with the string from mongodb atlas.
mongoose.connect("mongodb+srv://kh388:kh388@cluster0.ndr6d.mongodb.net/todolistDB", {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false})

// ejs template
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

// instead of using globle variable, we are going to use database to store the data
// let items = ["Buy Food", "Cook Food", "Eat Food"];
// let workItems = [];

// create schema for item
const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please check your data entry"]
    }
});

// create mongoose model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

// for every list we create, it will have a name and an array of itemsSchema
const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
    
    let day = date.getDate();

    // find() will return an array
    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {

            // insert all three default items if the array is empty
            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully inserted the items");
                }
            });
            // after insert the default items, we need to redirect it
            // so that the inserted items can display on the web
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});    
        }
    });
});

app.get("/:customListName", function(req, res) {
    const customListName = req.params.customListName;

    // findOne will return an "object"
    List.findOne({name: customListName}, function(err, foundList){
        if (!err) {
            if (!foundList) {
                // create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                // show existing list
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
            }
        }
    });
});


app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }
})



app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully deleted the item!!");
            }
            res.redirect("/");
        });
    } else {
        List.findOneAndUpdate({name: listName}, 
                              {$pull: {items: {_id: checkedItemId}}}, 
                              function(err, foundList) {
                                  if (!err) {
                                      res.redirect("/" + listName);
                                  }

        })
    }

    
});


app.post("/work", function(req, res) {
    let item = req.body.newItem;
    workItems.push(item);
    res.render("/work");
})

app.get("/about", function(req, res) {
    res.render("about");
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
    console.log("Server started on port: " + port + " successfully.");
}) 
