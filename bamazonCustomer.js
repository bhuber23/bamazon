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
    displayProducts();
});

function displayProducts() {
    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("Here is the existing inventory");
        var products = [["Item ID", "Product Name", "Price($)"]];
        for (var i = 0; i < res.length; i++) {
            products.push([res[i].item_id, res[i].product_name, res[i].price])
        }
        console.log(table(products));
        start();
    })
}

function start() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "buy",
                type: "list",
                message: "What item would you like to buy?",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].item_id + ": " + res[i].product_name);
                    }
                    return choiceArray;
                }
            },
            {
                name: "quantity",
                type: "number",
                message: "How many of that item would you like to buy?"
            }
        ])
            .then(function (answer) {
                var itemID = answer.buy.substr(0, answer.buy.indexOf(":"));
                var quantityNeeded = answer.quantity;

                var query = "SELECT * FROM products WHERE ?";
                connection.query(query, { item_id: itemID }, function (err, res) {
                    if (err) throw err;
                    var itemChosen = res[0];
                    if (quantityNeeded <= itemChosen.stock_quantity) {
                        console.log("Your item is in stock and your purchase has been completed.");
                        var updateQuery = "UPDATE products SET stock_quantity = " + (itemChosen.stock_quantity - quantityNeeded) + " WHERE item_id = " + itemID;
                        connection.query(updateQuery, function (err, res) {
                            if (err) throw err;
                            console.log("Thank you for your order! Your total is $" + (itemChosen.price * quantityNeeded).toFixed(2));
                            console.log("\n--------------------------------\n");
                            buyAgain();
                        });
                    }
                    else {
                        console.log("Sorry, there is not enough stock for the item you chose. Please try again.")
                        console.log("\n--------------------------------\n");
                        displayProducts();
                    }
                }

                );

            });
    });
}

function buyAgain() {
    inquirer.prompt([
        {
            name: "shop_again",
            type: "list",
            message: "Would you like to shop again?",
            choices: ["Yes", "No"]
        }
    ]).then(function (answer) {
        if (answer.shop_again === "Yes") {
            displayProducts();
        }
        else {
            connection.end()
        }
    })
}


