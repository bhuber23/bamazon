var mysql = require("mysql");
var inquirer = require("inquirer");
var {table} = require("table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Password",
    database: "bamazon"
});

connection.connect(function(err){
    if (err) throw err;
    start();
});

function start(){
    inquirer.prompt({
        name: "options",
        type: "list",
        message: "Which of the following would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    })
    .then(function(answer){
        if (answer.options === "View Products for Sale"){
            viewProducts();
        }
        else if (answer.options === "View Low Inventory"){
            lowInventory();
        }
        else if (answer.options === "Add to Inventory"){
            addInventory();
        }
        else{
            addProduct();
        }
    });
}

function viewProducts(){
    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("Here is the existing inventory:");
        console.log("\n--------------------------------\n");
        var products = [["Item ID", "Product Name", "Department", "Price", "Quantity"]];
        for (var i = 0; i < res.length; i++){
            products.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity])
        }
        console.log(table(products));
        start();
    });
}

//View inventory with stock less than 5
function lowInventory(){
    var query = "SELECT * FROM products WHERE stock_quantity < 5";
    connection.query(query, function(err, res){
        if (err) throw err;
        console.log("Here are the items that are low on inventory:")
        console.log("\n--------------------------------\n");

        var products = [["Item ID", "Product Name", "Price", "Quantity"]];
        for (var i = 0; i < res.length; i++){
            products.push([res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity])
        }
        console.log(table(products));
        start();

    })
}