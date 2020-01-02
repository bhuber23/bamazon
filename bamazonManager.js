var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Password",
    database: bamazon
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