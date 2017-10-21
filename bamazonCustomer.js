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
    displayProducts();
    
});



function displayProducts(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw console.log("error at displayProducts(): " + err);
        res.forEach(function(product) {
            t.cell('Product Id', product.id)
            t.cell('Product Name', product.product_name)
            t.cell('Price', product.price, Table.number(2))
            t.cell('Qty', product.stock_quantity)
            t.newRow()
          })          
          console.log(t.toString());
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
                        console.log("\n\r");
                        console.log("Purchase Succesfull");
                        var totalCost = res[0].price * answer.units;
                        console.log("Your Item(s) Cost: " + totalCost);
                        console.log("\n\r");
                        console.log("==============================================");
                        purchaseProduct();
                      } 
                );
            }
            else {
                console.log("==============================================");
                console.log("\n\r");
                console.log("Not enough in stock, choose a different quantity");
                console.log("\n\r");
                console.log("==============================================");
                purchaseProduct();
              }
        
        });
       
        });// inquier.prompt
    });// conection.query
  }// purchaseProduct()
