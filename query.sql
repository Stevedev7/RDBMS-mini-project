use MyRestaurant;
create table Food(
    Name varchar(255),
    _id varchar(255) primary key #20 characters,
    DietaryPreference varchar(255),
    Image varchar(500),
    Price integer,
    Category varchar(255),
    Description varchar(1000)
);
create table Beverages(
    Name varchar(255),
    _id varchar(255) primary key #25 characters,
    DietaryPreference varchar(255),
    Image varchar(500),
    Price integer,
    Description varchar(1000)
);

create table Comments(
    UserID varchar(30),
    FoodId varchar(20),
    BeverageID varchar(25),
    Text varchar(500) not null,
    date varchar(50),
    foreign key(UserID) references Users(_id) on update cascade on delete cascade,
    foreign key(FoodID) references Food(_id) on update cascade on delete cascade,
    foreign key(BeverageID) references Beverages(_id) on update cascade on delete cascade
);

create table Users(
    _id varchar(25) primary key,
    FirstName varchar(20),
    LastName varchar(20),
    UserName varchar(50),
    Password varchar(1024),
);
