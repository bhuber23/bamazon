var mysql = require("mysql");
var inquirer = require("inquirer");
var { table } = require("table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Password",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    inquirer.prompt({
        name: "options",
        type: "list",
        message: "Which of the following would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"]
    })
        .then(function (answer) {
            if (answer.options === "View Products for Sale") {
                viewProducts();
            }
            else if (answer.options === "View Low Inventory") {
                lowInventory();
            }
            else if (answer.options === "Add to Inventory") {
                addInventory();
            }
            else if (answer.options === "Add New Product"){
                addProduct();
            }
            else {connection.end()};
        });
}

function viewProducts() {
    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("Here is the existing inventory:");
        console.log("\n--------------------------------\n");
        var products = [["Item ID", "Product Name", "Department", "Price", "Quantity"]];
        for (var i = 0; i < res.length; i++) {
            products.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity])
        }
        console.log(table(products));
        start();
    });
}

//View inventory with stock less than 5
function lowInventory() {
    var query = "SELECT * FROM products WHERE stock_quantity < 5";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("Here are the items that are low on inventory:")
        console.log("\n--------------------------------\n");

        var products = [["Item ID", "Product Name", "Price", "Quantity"]];
        for (var i = 0; i < res.length; i++) {
            products.push([res[i].item_id, res[i].product_name, res[i].price, res[i].stock_quantity])
        }
        console.log(table(products));
        start();

    })
}

function addInventory() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "inventory",
                type: "list",
                message: "What item would you like to update the quantity of?",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].item_id + ": " + res[i].product_name + " || Quanitity: " + res[i].stock_quantity);
                    }
                    return choiceArray;
                }
            },
            {
                name: "amount_added",
                type: "number",
                message: "How many would you like to add?"
            }
        ]).then(function(answer){
            var itemID = answer.inventory.substr(0, answer.inventory.indexOf(":"));
            var quantityAdded = answer.amount_added;

            var query = "SELECT * FROM products WHERE ?";
            connection.query(query, { item_id: itemID }, function (err, res) {
                if (err) throw err;
                var itemChosen = res[0];
                var updateInventory = "UPDATE products SET stock_quantity = " + (itemChosen.stock_quantity + quantityAdded) + " WHERE item_id = " + itemID;
                connection.query(updateInventory, function(err, res){
                    console.log("The item's inventory has been updated to " + (itemChosen.stock_quantity + quantityAdded));
                    start();
                });
            
            }
        )
    });
})};

function addProduct(){
    inquirer.prompt([
        {
            name: "new_prod",
            type: "input",
            message: "What new product would you like to add?"
        },
        {
            name: "department",
            type: "input",
            message: "What department does this item belong to?"
        },
        {
            name: "price",
            type: "input",
            message: "What is the price of this item?"
        },
        {
            name: "stock",
            type: "number",
            message: "How many of this item are you adding?"
        }
    ]).then(function(answer){
        var productName = answer.new_prod;
        var departmentName = answer.department;
        var unitPrice = answer.price;
        var stock = answer.stock;
        var query = "INSERT INTO products SET ?";
        connection.query(query, {product_name: productName, department_name: departmentName, price: unitPrice, stock_quantity: stock}, function(err, res){
            if (err) throw err;
            console.log(productName + " has been added to the store inventory");
            console.log("\n------------------------------------\n");
        });
        var updateInventory = "UPDATE products SET stock_quanity = " + stock + " WHERE product_name = " + productName;
        connection.query(updateInventory, function(err, res){
            console.log("Your store's inventory has been updated: ");
            connection.query("SELECT * FROM products", function(err, res){
                if (err) throw err;
                var products = [["Item ID", "Product Name", "Department", "Price", "Quantity"]];
                for (var i = 0; i < res.length; i++) {
                    products.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity])
                }
                console.log(table(products));
                start();
            });
           
        });
    });
}
