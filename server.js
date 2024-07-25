const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt'); // For password hashing
const cors = require('cors'); // For enabling CORS

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

// Create a connection to the MySQL server
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

// Connect to the MySQL server
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database successfully!');

  // SQL query to create a new database
  db.query('CREATE DATABASE IF NOT EXISTS aiteken_db', (err, result) => {
    if (err) {
      console.error('Error creating database:', err);
      db.end(); // Close the connection
      return;
    }
    console.log('Database created successfully!');

    // Use the newly created database
    db.query('USE aiteken_db', (err, result) => {
      if (err) {
        console.error('Error switching to database:', err);
        db.end(); // Close the connection
        return;
      }
      console.log('Switched to database successfully!');

      // SQL query to create Users table
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS Users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      // SQL query to create Expenses table
      const createExpensesTable = `
        CREATE TABLE IF NOT EXISTS Expenses (
          expense_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          category_id INT,
          amount DECIMAL(10, 2) NOT NULL,
          date DATE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES Users(user_id),
          FOREIGN KEY (category_id) REFERENCES Categories(category_id)
        )
      `;

      // SQL query to create Categories table
      const createCategoriesTable = `
        CREATE TABLE IF NOT EXISTS Categories (
          category_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          category_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
      `;

      // SQL query to create Payment Methods table
      const createPaymentMethodsTable = `
        CREATE TABLE IF NOT EXISTS PaymentMethods (
          payment_method_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          payment_method_name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES Users(user_id)
        )
      `;

      // SQL query to create Budgets table
      const createBudgetsTable = `
        CREATE TABLE IF NOT EXISTS Budgets (
          budget_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          category_id INT,
          amount DECIMAL(10, 2) NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES Users(user_id),
          FOREIGN KEY (category_id) REFERENCES Categories(category_id)
        )
      `;

      // Execute each table creation query
      db.query(createUsersTable, (err, result) => {
        if (err) {
          console.error('Error creating Users table:', err);
        } else {
          console.log('Users table created successfully!');
        }
      });

      db.query(createCategoriesTable, (err, result) => {
        if (err) {
          console.error('Error creating Categories table:', err);
        } else {
          console.log('Categories table created successfully!');
        }
      });

      db.query(createPaymentMethodsTable, (err, result) => {
        if (err) {
          console.error('Error creating PaymentMethods table:', err);
        } else {
          console.log('PaymentMethods table created successfully!');
        }
      });

      db.query(createExpensesTable, (err, result) => {
        if (err) {
          console.error('Error creating Expenses table:', err);
        } else {
          console.log('Expenses table created successfully!');
        }
      });

      db.query(createBudgetsTable, (err, result) => {
        if (err) {
          console.error('Error creating Budgets table:', err);
        } else {
          console.log('Budgets table created successfully!');
        }

        // End the connection when done
        db.end();
      });
    });
  });
});

// User Registration Route
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt(10); // Generate salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash password

    const query = 'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Error registering user' });
        return;
      }
      res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// User Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const query = 'SELECT * FROM Users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Error logging in' });
        return;
      }
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password); // Compare hashes
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      res.status(200).json({ message: 'Login successful', userId: user.user_id });
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
