# Overview

As a software engineer expanding into full-stack web development, I built Recipe Explorer — a web application that lets users browse meal categories, search for recipes by name, and view detailed recipe pages with ingredients and step-by-step cooking instructions. All data is fetched live from TheMealDB API.

To start the test server, run `npm install` followed by `node server.js` from the project directory. Then open your browser to `http://localhost:3000` to see the home page.

My purpose for building this was to learn how server-side web frameworks work, specifically how Express handles routing, how EJS templates generate dynamic HTML, and how to integrate a third-party API into a web application. This project builds directly on the JavaScript and Node.js fundamentals I learned in Module 1.

[Software Demo Video](http://youtube.link.goes.here)

# Web Pages

The app has three dynamically generated pages plus a category filter view:

- **Home Page (/):** Displays a welcome message and a grid of meal categories fetched from the API. Each category shows a thumbnail image and description. Users can click any category to see meals in that category, or use the search bar in the navigation to search by name.

- **Search Results (/search?q=query):** Displays recipe cards matching the user's search query. Each card shows the meal name, category, cuisine, and a link to view the full recipe. If no results are found, a helpful message suggests alternative searches.

- **Recipe Details (/recipe/:id):** Shows the complete recipe including a large image, category and cuisine badges, a full ingredients list with measurements, and numbered cooking instructions. If the recipe has an associated YouTube video, a link is provided.

The navigation bar appears on every page with a persistent search form, so users can search from anywhere in the app.

# Development Environment

I used Visual Studio Code as my code editor and Git for version control. The application runs on Node.js and was developed and tested on macOS.

The programming language is JavaScript (ES6+) running on Node.js. Libraries and frameworks used include:
- **Express** (v4.18.2) — Web application framework for routing and middleware
- **EJS** (v3.1.9) — Embedded JavaScript templating engine for generating dynamic HTML
- **axios** (v1.6.0) — HTTP client for fetching recipe data from TheMealDB API

# Useful Websites

- [Express.js Official Documentation](https://expressjs.com/)
- [EJS Templating Documentation](https://ejs.co/)
- [TheMealDB API Documentation](https://www.themealdb.com/api.php)
- [MDN Web Docs - HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [Node.js Official Documentation](https://nodejs.org/en/docs/)

# Future Work

- Add user accounts so people can save their favorite recipes
- Implement a random recipe button that suggests a meal when the user cannot decide
- Add pagination to search results so the page does not get too long with many results
