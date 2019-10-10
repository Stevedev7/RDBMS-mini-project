const mysql = require("mysql");
const makeId = require('./makeId');
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'menu',
  password : 'menu',
  database : 'MyRestaurant'
});
const desc = "Suspendisse ut ipsum velit. Aenean mattis ligula quam, ac tincidunt tellus congue et. Donec accumsan, quam eget sagittis semper, massa augue pharetra nisi, in laoreet nisl lectus non nisi. Maecenas sit amet felis velit. Vestibulum in mauris nec enim lacinia eleifend a at sem. Maecenas a turpis ultricies, posuere sapien vitae, pharetra leo. Sed at ex eget nulla pharetra facilisis.";
var food = [
    {
        name: "Chicken Biryani",
        image:"https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Fnorecipes.com%2Fwp-content%2Fuploads%2F2017%2F05%2Fchicken-biryani-11.jpg&f=1&nofb=1",
        price: 150,
        type1: "Non-veg",
        type2: "Main course"
    },
    {
        name: "Barbequed goat meat",
        image: "https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.africa-uganda-business-travel-guide.com%2Fimages%2Fhow-to-barbequegrillroast-goat-meat-in-uganda-the-more-advanced-way-21819083.jpg&f=1&nofb=1",
        price: 420,
        type1: "Non-veg",
        type2: "Starters"
    },
    {
        name: "Paneer Tikka",
        image: "https://i.ndtvimg.com/i/2015-07/paneer-tikka-625_625x350_81436947019.jpg",
        price: 120,
        type1: "Veg",
        type2: "Starters"
    },
    {
        name: "Crispy Chicken",
        image: "https://i.ndtvimg.com/i/2015-07/fried-chicken-625_625x350_41436947175.jpg",
        price: 180,
        type1: "Non-veg",
        type2: "Starters"
    },
    {
        name: "Frozen Oreo",
        image:"https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Flilluna.com%2Fwp-content%2Fuploads%2F2014%2F07%2FedIMG_7447.jpg&f=1&nofb=1",
        price: 150,
        type1: "Veg",
        type2: "Dessert"
    }
];
var bev = [
    {
        name: "Virgin mojito",
        image: "https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fmoroccanladies.com%2Fwp-content%2Fuploads%2F2016%2F07%2FGet-addicted-to-this-Virgin-Mojito.jpg&f=1&nofb=1",
        price: 120,
        type : "Non-alcoholic"
    },
    {
        name: "Cranberry Margarita",
        image: "https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.gimmesomeoven.com%2Fwp-content%2Fuploads%2F2013%2F11%2FCranberry-Margaritas-1.jpg&f=1&nofb=1",
        price: 200,
        type : "Alcoholic"
    },
    {
        name: "Midnight kiss",
        image: "https://proxy.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.wikihow.com%2Fimages%2F2%2F2f%2FMake-a-Blue-Lagoon-Cocktail-Step-5.jpg&f=1&nofb=1",
        price: 200,
        type : "Alcoholic"
    },
    {
        name: "Lemon tea",
        image: "https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Fd3cizcpymoenau.cloudfront.net%2Fimages%2F26396%2FSFS_chocolate_milkshakes-13.jpg&f=1&nofb=1",
        price: 100,
        type : "Non-alcoholic"
    },
    {
        name: "Chocolate milkkshake",
        image: "https://wonkywonderful.com/wp-content/uploads/2015/09/spicy-chocolate-milkshake-2.jpg",
        price: 150,
        type : "Non-alcoholic"
    }
];
module.exports = () =>{
    db.query(`DELETE FROM Food`, (err, result)=>{
        if(err) throw err;
        console.log("Food items removed");
        food.forEach(x=>{
            let fid = makeId(20);
            db.query(`INSERT INTO Food VALUES(\'${x.name}\', \'${fid}\', \'${x.type1}\', \'${x.image}\', ${x.price}, \'${x.type2}\', \'${desc}\')`, (err, result)=>{
                if(err) throw err;
                console.log(`${x.name} added`);
                db.query(`INSERT INTO Comments values (\'loki@1234\', \'${fid}\', null, \'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\', \'2912-20-90\')`, (err, res) =>{
                    if(err) throw err;
                    console.log(`Comment added to ${x.name}`);
                });
            });
        });
        db.query(`DELETE FROM Beverages`, (err, result) =>{
            if(err) throw err;
            console.log("Beverage items removed");
            bev.forEach(y=>{
                let bid = makeId(25);
                db.query(`INSERT INTO Beverages VALUES (\'${y.name}\', \'${bid}\', \'${y.type}\', \'${y.image}\', ${y.price}, \'${desc}\')`, (err, result =>{
                    if(err) throw err;
                    console.log(`${y.name} added`);
                    db.query(`INSERT INTO Comments values (\'loki@1234\', null, \'${bid}\', \'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\', \'2912-20-90\')`, (err, res) =>{
                        if(err) throw err;
                        console.log(`Comment added to ${y.name}`);
                    });
                }));
            });
        });
    });
};
