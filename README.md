# Campus Event Management System

A web-based application designed to simplify and organize college campus events, featuring user authentication, role-based dashboards (Student, Organizer, Admin), and event registration.

## Prerequisites
- Node.js installed on your system.

## Setup Instructions
1. Extract or clone this project folder.
2. Open your terminal inside the project directory and install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Visit http://localhost:3000 in your browser.

## Features
- User registration and login
- Role-based access for student, organizer, and admin users
- Event creation and deletion
- Event registration by students

## Project Structure
- `models/db.js` contains Sequelize models and database configuration.
- `views/` holds EJS templates.
- `app.js` sets up Express routes and the server.
