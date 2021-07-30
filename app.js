const express= require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();

app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Dinesh:9348686697@cluster0.kufzv.mongodb.net/todolistDB",{useNewUrlParser:true},{useUnifiedTopology: true});

const itemsSchema=mongoose.Schema({
  name:{
    type:String,
    required:true
  }
});

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome"
});
const item2=new Item({
  name:"Press the + button to add more items"
});
const item3=new Item({
  name:"Bye"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);


app.get("/",function(req , res){
  Item.find({},function(err,foundItems){
    if(foundItems.length==0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved default items");
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{listTitle : "Today", newItemList : foundItems});
    }
  });
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list =new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
      res.render("list",{listTitle : foundList.name, newItemList : foundList.items});
      }
    }
  });


});
app.post("/",function(req , res){
  const itemName=req.body.newItem;
  const listName=req.body.list;
  const item =new Item({
    name:itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res){
  const checkboxItemId=req.body.checkbox;
  const listName=req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkboxItemId,function(err){
      if(!err){
        console.log("Item deleted Successfully");
        res.redirect("/")
      }
    });
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkboxItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});
app.get("/work",function(req,res){
  res.render("list",{listTitle:"Work List", newItemList:workItems})
})
app.post("/work",function(req,res){
  let item=req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

let port=process.env.PORT
if(port == "null"||port ==""){
  port=3000;
}
app.listen(port,function(req,res){
  console.log("Server has started Successfully");
});
