const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let today = date.getDate();

mongoose.connect(
  "mongodb+srv://admin-lakshay:hello123@cluster0.4jdfr.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }
);

const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

const defaultItems = [];
let l = "";
app.get("/", function (req, res) {
  res.render("list", { ListTitle: today, newListItems: defaultItems });
  // console.log(defaultItems);
});

app.get("/:newList", function (req, res) {
  const newList = _.capitalize(req.params.newList);

  List.findOne({ name: newList }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: newList,
          items: defaultItems,
        });

        list.save();

        res.redirect("/" + newList);
      } else {
        const newL = defaultItems.concat(foundList.items);
        res.render("list", {
          ListTitle: newList,
          newListItems: foundList.items,
        });
        // console.log("default ==" + defaultItems);
        // console.log(foundList.items);
      }
    }
  });
});

app.post("/go", function (req, res) {
  const go = req.body.addList;
  res.redirect("/" + go);
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === today) {
    item.save();
    defaultItems.push(item);
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (errr, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === today) {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        // console.log("Successs");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, result) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.listen(3000, function () {
  console.log("Server started with 3000");
});
