var inquirer = require("inquirer");
var mysql = require("mysql");
var Table = require('easy-table')
var t = new Table;

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
                addProduct();
                break;
            }
          });

         
        });// inquier.prompt
    }

 /***********************
 * DISPLAY ALL PRODUCTS
 ***********************/ 
  
function displayProducts(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw console.log("error at displayProducts(): " + err);

        res.forEach(function(product) {
            t.cell('Product Id', product.id)
            t.cell('Product Name', product.product_name)
            t.cell('Department', product.department_name)
            t.cell('Price', product.price, Table.number(2))
            t.cell('Qty', product.stock_quantity)
            t.newRow()
          })  
          console.log(t.toString());

        chooseYourAdventure();
    });
    
}

/***********************
 * VIEW LOW INVENTORY
 ***********************/

function viewLowInventory(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw console.log("error at displayProducts(): " + err);
        console.log("==============================================");
        console.log("LOW INVENTORY - RESTOCK SOON");
        for (var i = 0; i < res.length; i++){
            if (res[i].stock_quantity <= 5){
            
                t.cell('Product Id', res[i].id)
                t.cell('Product Name', res[i].product_name)
                t.cell('Department', res[i].department_name)
                t.cell('Price', res[i].price, Table.number(2))
                t.cell('Qty', res[i].stock_quantity)
                t.newRow()

            }            
            
        }
        console.log(t.toString());
        console.log("==============================================");
        chooseYourAdventure();
    });
    
}

/***********************
 * ADD INVENTORY
 ***********************/

function addInventory() {
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
                        console.log("Stock QTY Updated");
                        console.log("ID: " + res[0].id + " | " + " Product Name: " + res[0].product_name + " Department: " + res[0].department_name + " Price: " + res[0].price + " Stock Qty: " + NewDbStock)
                        console.log("==============================================");
                    }
                );
                chooseYourAdventure();
        });
        });// inquier.prompt
    });// conection.query  
  }// addToInventory()
  
/***********************
 * ADD NEW PRODUCTS
 ***********************/

  function addProduct() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw console.log("connection error: " + err);
        
        inquirer.prompt([
            { 
              name: "product_name",
              type: "input",            
              message: "Enter the product name",
            },
            { 
                name: "department_name",
                type: "input",            
                message: "Enter the department for this product",
              },
            {
              name: "price",
              type: "input",
              message: "Enter the product price",
              validate: function(value) {
                  if (isNaN(value) === false) {
                    return true;
                  }
                  return false;
                }
            },
            {
                name: "stock_quantity",
                type: "input",
                message: "Enter the product inventory",
                validate: function(value) {
                    if (isNaN(value) === false) {
                      return true;
                    }
                    return false;
                  }
              },      
        ])
        .then(function(answer) {
            connection.query(
                "INSERT INTO products SET ?",
                {
                  product_name: answer.product_name,
                  department_name: answer.department_name,
                  price: answer.price,
                  stock_quantity: answer.stock_quantity
                },
                    function(error) {
                        if (error) throw err;
                        
                        console.log("==============================================");
                        console.log("Your Item Was Added");
                        console.log("==============================================");
                    }
                );
                chooseYourAdventure();
        });// inquier.prompt
    });// conection.query  
  }// addToInventory()
  