CREATE TABLE Users (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL
);

CREATE TABLE Products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    user_id INT NOT NULL, 
    CONSTRAINT fk_seller
        FOREIGN KEY (user_id) 
        REFERENCES Users(id)
        ON DELETE CASCADE 
);

CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL, 
    buyer_id INT NOT NULL,   
    CONSTRAINT fk_product
        FOREIGN KEY (product_id) 
        REFERENCES Products(id)
        ON DELETE CASCADE, 
    CONSTRAINT fk_buyer
        FOREIGN KEY (buyer_id) 
        REFERENCES Users(id)
        ON DELETE CASCADE 
);
