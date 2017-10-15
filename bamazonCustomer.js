

// 3. Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.

// 4. If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.

// 5. However, if your store does have enough of the product, you should fulfill the customer's order.

// 6. This means updating the SQL database to reflect the remaining quantity.
// Once the update goes through, show the customer the total cost of their purchase.
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
    displayProducts();
})

function displayProducts(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw console.log("error at displayProducts(): " + err);
        console.log("ID    " + " Product Name                            " + " Department "  + " Price "  + " Stock Qty ");
        console.log("----- " + " --------------------------------------- " + " ---------- "  + " ----- "  + " --------- ");

        for (var i = 0; i < res.length; i++){
            console.log(res[i].id + "   " + res[i].product_name + "   " + res[i].department_name + "   " + res[i].price + "   " + res[i].stock_quantity);
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
            
        // console.log("ID: " + answer.id);
        // console.log("Units: " + answer.units);
        
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
                        console.log("Purchase Succesfull");
                        displayProducts();
                    
                      }
                );
            }
            else {
                console.log("Not enough in stock");
                displayProducts();
               
              }
        
        });

         
        });// inquier.prompt
    });// conection.query
  }// purchaseProduct()