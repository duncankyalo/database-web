# Database Managment with MySQL and Node.js

## Description:
In this week, you will dive into relational databases using MySQL and integrate it with Node.js using Sequelize. You will design a database schema for storing expense data, and user profiles. This will provide hands-on experience with database design, SQL queries, and ORM (Object-Relational Mapping) libraries in Node.js.

## Requirements:

### Database Schema Design:
        Users
                user_id (Primary Key)
                username
                email
                password
                created_at
                updated_at
                
        Expenses
                expense_id (Primary Key)
                user_id (Foreign Key referencing Users)
                category_id (Foreign Key referencing Categories)
                amount
                date
                description
                created_at
                updated_at
                
        Categories
                category_id (Primary Key)
                user_id (Foreign Key referencing Users)
                category_name
                created_at
                updated_at
                
        Payment Methods
                payment_method_id (Primary Key)
                user_id (Foreign Key referencing Users)
                payment_method_name
                created_at
                updated_at
        
        Budgets
                budget_id (Primary Key)
                user_id (Foreign Key referencing Users)
                category_id (Foreign Key referencing Categories)
                amount
                start_date
                end_date
                created_at
                updated_at

### Submission:
        Submit the link to your GitHub repository for evaluation through the GitHub Classrooms assignment.
