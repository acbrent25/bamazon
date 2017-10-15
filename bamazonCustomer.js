var inquirer = require("inquirer");
var mysql = require("mysql");
const {table} = require('table');

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
    displayProducts();
})

function displayProducts(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw console.log("error at displayProducts(): " + err);

        // console.log("ID    " + " Product Name                            " + " Department "  + " Price "  + " Stock Qty ");
        // console.log("----- " + " --------------------------------------- " + " ---------- "  + " ----- "  + " --------- ");
        for (var i = 0; i < res.length; i++){
            console.log("ID: " + res[i].id + " | " + " Product Name: " + res[i].product_name + " Department: " + res[i].department_name + " Price: " + res[i].price + " Stock Qty: " + res[i].stock_quantity);
 
        }
        purchaseProduct();
    });
}

// function which prompts the user for what action they should take
function purchaseProduct() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw console.log("connection error: " + err);
        inquirer.prompt([
          {
              name: "id",
              type: "input",            
              message: "Enter the ID of the pruduct you wish to purchase",
            },
            {
              name: "units",
              type: "input",
              message: "How many would you like to buy?",
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

            console.log("ID from Inquirer: " + answer.id);
            console.log("Units from Inquirer: " + answer.units);

            console.log("id from DB: " + res[0].id);
            console.log("stock quantity from DB: " + res[0].stock_quantity);

            var dbStock = res[0].stock_quantity;
            var reqStock = answer.units;

            if (dbStock >= reqStock){

                var NewDbStock = dbStock - reqStock;

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
                        console.log("==============================================");
                        console.log("Purchase Succesfull");
                        var totalCost = res[0].price * answer.units;
                        console.log("Your Item(s) Cost: " + totalCost);
                        console.log("==============================================");
                        displayProducts();
                    
                      }
                );
            }
            else {
                console.log("==============================================");
                console.log("Not enough in stock, choose a different quantity");
                console.log("==============================================");
                displayProducts();
               
              }
        
        });

         
        });// inquier.prompt
    });// conection.query
  }// purchaseProduct()