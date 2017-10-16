var inquirer = require("inquirer");
var mysql = require("mysql");

var newStockQuantity = 0;

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazonDB"
});

connection.connect(function(err){
    if (err) throw console.log("error at connection.connect: " + err);;
    console.log("connected as id: " + connection.threadId + "\n");
    chooseYourAdventure();
})

/***********************
 * Choose Your Adventure
 ***********************/

function chooseYourAdventure() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw console.log("connection error: " + err);
        inquirer.prompt([
          {
              name: "userChoice",
              type: "list",            
              message: "Wht would you like to manage?",
              choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
            }   
        ])
        .then(function(answer) {
            switch (answer.userChoice) {
              case "View Products for Sale":
                displayProducts();
                break;
      
              case "View Low Inventory":
                viewLowInventory();
                break;
      
              case "Add to Inventory":
                console.log("Add to Inventory");
                break;
      
              case "Add New Product":
                console.log("Add New Product");
                break;
            }
          });

         
        });// inquier.prompt
    }

  
  
function displayProducts(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw console.log("error at displayProducts(): " + err);
        
        for (var i = 0; i < res.length; i++){
            console.log("ID: " + res[i].id + " | " + " Product Name: " + res[i].product_name + " Department: " + res[i].department_name + " Price: " + res[i].price + " Stock Qty: " + res[i].stock_quantity);
        }
    });
}


function viewLowInventory(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw console.log("error at displayProducts(): " + err);
        
        for (var i = 0; i < res.length; i++){
            if (res[i].stock_quantity <= 5){
                console.log("ID: " + res[i].id + " | " + " Product Name: " + res[i].product_name + " Department: " + res[i].department_name + " Price: " + res[i].price + " Stock Qty: " + res[i].stock_quantity);
            } 
        }
    });
}