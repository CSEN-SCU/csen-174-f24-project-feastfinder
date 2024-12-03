const axios = require('axios'); // Make sure to import axios
const fs = require('fs'); // Assuming you read restaurant data from JSON files

// Replace with your actual Yelp API Key
const YELP_API_KEY = 'kKs-Fp2V111fT-t7iY73Cd26pLti6WwjnfZV2b_revDOGt_8xBqGv7EKugia4Sl1KDtxQbdTv_x7zoJO4liouwSxPCLabwnZ8VMr9CXq5KXmzRM_LYcQzUzE_Sg1Z3Yx';

const curateRestaurants = async (cuisines) => {
    console.log("fetching Yelp data...");
  
    // Create an array to store the random restaurant data
    const randRest = [];
  
    // Fetch restaurants from Yelp API based on cuisine preferences
    for (const cuisine of cuisines) {
      try {
        // Make API call to Yelp for each cuisine
        const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
          params: {
            term: cuisine,  // Cuisine type (e.g., "Italian", "Mexican")
            location: 'San Jose',  // Replace with dynamic location if needed
            limit: 10  // Get 10 businesses as candidates
          },
          headers: {
            Authorization: `Bearer ${YELP_API_KEY}`
          }
        });
  
        // Check if the Yelp API returned results
        if (response.data.businesses && Array.isArray(response.data.businesses) && response.data.businesses.length > 0) {
          // Randomly select two restaurants from the response data
          const randomRestaurants = response.data.businesses
            .sort(() => 0.5 - Math.random())  // Shuffle the results
            .slice(0, 2);  // Take the first two restaurants
  
          // Add the selected restaurants to the randRest array
          randRest.push(...randomRestaurants);
        } else {
          console.log(`No restaurants found for cuisine: ${cuisine}`);
        }
      } catch (error) {
        console.error(`Error fetching Yelp data for cuisine ${cuisine}:`, error.message);
      }
    }
  
    console.log("Final curated restaurants:", randRest);  // Check the curated restaurants before returning
    return randRest;
  };
  
  
module.exports = { curateRestaurants };
