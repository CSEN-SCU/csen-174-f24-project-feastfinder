[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Qo7P6ILb)

### HTML Yelp Search + Preference Test
This is a simple test program that shows how the search results might look with the ability to select specific preferences.
The preferences ideally would be in a list that the user can select before looking at restaurants so that the API request can use the preferences as parameters.

### Testing
Open file in VScode, make sure the Live Server extension is installed, then right-click and say "Open Server". This will open it locally on your default browser.

### Features
* Currently, the program uses HTML, CSS, and JavaScript to function.
* The page first displays checkboxes with restaurant categories that the user can select
* The "Fetch Restaurants" button calls a function to read and store the values the user checked and adds them to the Yelp search request
* The first 20 restaurants in San Jose that best match the parameters are displayed in a list below the preference options
    * The image, name, price, location, and rating of each restaurant are displayed one row at a time
    * When clicking on a restaurant, it opens the restaurant's page in a new tab
    * If no preferences are selected, restaurants will still be displayed

### Notes
There is a lot of customization for what is displayed. I chose to hard code the location and amount of search results into the query just for testing purposes. To make the results more tailored to the user, other attributes can be added to the request in the same way as the preference checklist.

Since I am not entirely sure what we are doing for the frontend (and I learned I absolutely suck at Nodejs stuff), I did this in HTML and Javascript since it was the easiest to learn on the fly.

Shoutout ChatGPT for restructuring a lot of my initial code and adding comments.

