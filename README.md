p# Campus Event Management System

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
- Searchable and category-filtered event listings
- Six seeded sample events for technical, cultural, workshop, sports, seminar, and social-service activities

## Project Structure
- `models/db.js` contains Sequelize models and database configuration.
- `views/` holds EJS templates.
- `app.js` sets up Express routes and the server.

## Sample events
The six demonstration events are defined in the `DEMO_EVENTS` array in `app.js`. Their dates, venues, descriptions, categories, and capacities can be edited there. They are added to the existing SQLite database on startup only when an event with the same title is not already present; existing events such as Bloom Fest are preserved. The app also adds the `category` column to older databases and labels existing events as `General`.

These are sample schedules, not confirmed official college events. Confirm event details with organizers before publishing them as official information.
