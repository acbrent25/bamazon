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
                addInventory();
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
            console.log("\n\r");
            console.log("ID: " + res[i].id + " | " + " Product Name: " + res[i].product_name + " | " + " Department: " + res[i].department_name + " | " + " Price: " + res[i].price + " | " + " Stock Qty: " + res[i].stock_quantity);
        }
        chooseYourAdventure();
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
        chooseYourAdventure();
    });
    
}

function addInventory() {
    displayProducts();
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw console.log("connection error: " + err);
        
        inquirer.prompt([
          {
              name: "id",
              type: "input",            
              message: "Enter the ID of the pruduct you wish to add inventory to",
            },
            {
              name: "units",
              type: "input",
              message: "How many would you like to add?",
              validate: function(value) {
                  if (isNaN(value) === false) {
                    return true;
                  }
                  return false;
                }
          }      
        ])
        .then(function(answer) {
        var query = "SELECT * FROM products WHERE ?";
        connection.query(query, { id: answer.id }, function(err, res) {
            
            var dbStock = res[0].stock_quantity;
            var reqStock = answer.units;
            var completed = false;
            var NewDbStock = parseInt(dbStock) + parseInt(reqStock);
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: NewDbStock
                        },
                        {
                            id: answer.id
                        }
                    ],
                    function(error) {
                        if (error) throw err;
                        completed === true;
                        console.log("==============================================");
                        console.log("\n\r");
                        console.log("Stock QTY Updated");
                        console.log("ID: " + res[0].id + " | " + " Product Name: " + res[0].product_name + " Department: " + res[0].department_name + " Price: " + res[0].price + " Stock Qty: " + res[0].stock_quantity)
                        console.log("\n\r");
                        console.log("==============================================");
                    }
                );

        });
        });// inquier.prompt
    });// conection.query  
  }// addToInventory()