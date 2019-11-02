use MyRestaurant;

create table Users(
    _id varchar(30) primary key,
    FirstName varchar(20),
    LastName varchar(20),
    Username varchar(50),
    Password varchar(1024)
);

create table Food(
    _id varchar(20) primary key,
    Name varchar(255),
    DietaryPreference varchar(255),
    Image varchar(500),
    Price integer,
    Category varchar(255),
    Description varchar(1000)
);

create table Beverages(
    _id varchar(25) primary key,
    Name varchar(255),
    DietaryPreference varchar(255),
    Image varchar(500),
    Price integer,
    Description varchar(1000)
);

create table Comments(
    UserID varchar(30),
    FoodID varchar(20),
    BeverageID varchar(25),
    Text varchar(500) not null,
    date varchar(50),
    foreign key(UserID) references Users(_id) on update cascade on delete cascade,
    foreign key(FoodID) references Food(_id) on update cascade on delete cascade,
    foreign key(BeverageID) references Beverages(_id) on update cascade on delete cascade
);

create table Orders(
    OrderID varchar(35) primary key,
    UserID varchar(30),
    FoodID varchar(20),
    BeverageID varchar(25),
    Quantity integer not null,
    date varchar(50),
    foreign key(UserID) references Users(_id) on update cascade on delete cascade,
    foreign key(FoodID) references Food(_id) on update cascade on delete cascade,
    foreign key(BeverageID) references Beverages(_id) on update cascade on delete cascade
);

INSERT INTO Users VALUES ('1234567890', 'Test', 'User', 'testuser', 'test1234');
