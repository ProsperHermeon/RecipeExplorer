/**
 * Recipe Explorer - Web Application Server
 *
 * A Node.js web application using Express and EJS that allows users to
 * browse meal categories, search for recipes, and view detailed recipe
 * information. All data is fetched from TheMealDB API.
 *
 * This app demonstrates:
 * - Multiple dynamically generated HTML pages (Home, Search, Recipe Details)
 * - Interactive content based on user input (search form)
 * - Server-side rendering with EJS templates
 * - Express routing and middleware
 * - API integration with axios
 */

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;
const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

// ============================================================
// MIDDLEWARE CONFIGURATION
// ============================================================

/**
 * Set EJS as the templating engine so Express can render
 * dynamic HTML pages from .ejs template files.
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Serve static files (CSS, images) from the 'public' directory.
 * This allows our HTML pages to link to /styles.css directly.
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Parse URL-encoded form data from POST requests.
 * This enables reading form submissions from the search bar.
 */
app.use(express.urlencoded({ extended: true }));

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Extracts a clean list of ingredients and their measurements
 * from a TheMealDB meal object. The API stores ingredients in
 * properties named strIngredient1 through strIngredient20.
 *
 * @param {Object} meal - A meal object from TheMealDB API
 * @returns {Array<Object>} Array of {ingredient, measure} objects
 */
function extractIngredients(meal) {
    const ingredients = [];
    // Loop through all 20 possible ingredient slots
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        // Only include non-empty ingredients
        if (ingredient && ingredient.trim() !== '') {
            ingredients.push({
                ingredient: ingredient.trim(),
                measure: measure ? measure.trim() : ''
            });
        }
    }
    return ingredients;
}

/**
 * Splits cooking instructions into an array of individual steps.
 * Handles various separators found in TheMealDB data.
 *
 * @param {string} instructions - Raw instruction text from the API
 * @returns {Array<string>} Array of individual cooking steps
 */
function formatInstructions(instructions) {
    if (!instructions) return ['No instructions available.'];
    // Split on newlines or periods followed by spaces
    return instructions
        .split(/\r\n|\n/)
        .map(step => step.trim())
        .filter(step => step.length > 0);
}

// ============================================================
// ROUTES
// ============================================================

/**
 * HOME PAGE - GET /
 *
 * Fetches all meal categories from TheMealDB and renders the
 * home page with a grid of clickable category cards.
 * This is the first dynamically generated page.
 */
app.get('/', async (req, res) => {
    try {
        // Fetch all meal categories from the API
        const response = await axios.get(`${API_BASE}/categories.php`);
        const categories = response.data.categories || [];

        // Render home.ejs template with category data
        res.render('home', {
            title: 'Recipe Explorer',
            categories: categories,
            error: null
        });
    } catch (error) {
        // Handle API errors gracefully
        console.error('Error fetching categories:', error.message);
        res.render('home', {
            title: 'Recipe Explorer',
            categories: [],
            error: 'Unable to load categories. Please try again later.'
        });
    }
});

/**
 * SEARCH RESULTS PAGE - GET /search
 *
 * Takes the user's search query from the URL parameter,
 * searches TheMealDB API by meal name, and renders results.
 * This is the second dynamically generated page.
 */
app.get('/search', async (req, res) => {
    const query = req.query.q || '';

    // If no query provided, redirect back to home
    if (!query.trim()) {
        return res.redirect('/');
    }

    try {
        // Search for meals matching the user's query
        const response = await axios.get(`${API_BASE}/search.php?s=${encodeURIComponent(query)}`);
        const meals = response.data.meals || [];

        // Render search.ejs with the results
        res.render('search', {
            title: `Search: ${query}`,
            query: query,
            meals: meals,
            resultCount: meals.length,
            error: null
        });
    } catch (error) {
        // Handle API errors gracefully
        console.error('Error searching recipes:', error.message);
        res.render('search', {
            title: `Search: ${query}`,
            query: query,
            meals: [],
            resultCount: 0,
            error: 'Unable to search recipes. Please try again later.'
        });
    }
});

/**
 * RECIPE DETAILS PAGE - GET /recipe/:id
 *
 * Fetches full details for a specific meal by its ID and renders
 * a detailed view with ingredients, measurements, and instructions.
 * This is the third dynamically generated page.
 */
app.get('/recipe/:id', async (req, res) => {
    const mealId = req.params.id;

    try {
        // Fetch the full meal details by ID
        const response = await axios.get(`${API_BASE}/lookup.php?i=${mealId}`);
        const meal = response.data.meals ? response.data.meals[0] : null;

        // If meal not found, show error
        if (!meal) {
            return res.render('recipe', {
                title: 'Recipe Not Found',
                meal: null,
                ingredients: [],
                steps: [],
                error: 'Recipe not found. It may have been removed from the database.'
            });
        }

        // Extract ingredients and format instructions
        const ingredients = extractIngredients(meal);
        const steps = formatInstructions(meal.strInstructions);

        // Render recipe.ejs with full meal details
        res.render('recipe', {
            title: meal.strMeal,
            meal: meal,
            ingredients: ingredients,
            steps: steps,
            error: null
        });
    } catch (error) {
        // Handle API errors gracefully
        console.error('Error fetching recipe:', error.message);
        res.render('recipe', {
            title: 'Error',
            meal: null,
            ingredients: [],
            steps: [],
            error: 'Unable to load recipe details. Please try again later.'
        });
    }
});

/**
 * CATEGORY FILTER - GET /category/:name
 *
 * Fetches all meals in a specific category and displays them
 * on the search results page. This reuses the search template.
 */
app.get('/category/:name', async (req, res) => {
    const categoryName = req.params.name;

    try {
        // Fetch meals filtered by category
        const response = await axios.get(`${API_BASE}/filter.php?c=${encodeURIComponent(categoryName)}`);
        const meals = response.data.meals || [];

        // Render using search template with category results
        res.render('search', {
            title: `Category: ${categoryName}`,
            query: categoryName,
            meals: meals,
            resultCount: meals.length,
            error: null
        });
    } catch (error) {
        console.error('Error fetching category:', error.message);
        res.render('search', {
            title: `Category: ${categoryName}`,
            query: categoryName,
            meals: [],
            resultCount: 0,
            error: 'Unable to load category. Please try again later.'
        });
    }
});

// ============================================================
// START SERVER
// ============================================================

/**
 * Start the Express server and listen on the specified port.
 * The server will be accessible at http://localhost:3000
 */
app.listen(PORT, () => {
    console.log(`Recipe Explorer is running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server.');
});
