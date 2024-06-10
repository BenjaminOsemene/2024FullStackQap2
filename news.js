//Here node-fetch package is used to fetch and retun data from external APIs using  getNews, getWeather, and getMovies methods
const fetch = require('node-fetch');

async function getNews() {
  try {
    const newsResponse = await fetch('https://newsapi.org/v2/top-headlines?country=us&apiKey=607439218ac641948b31a03263bef4b2');
    const newsData = await newsResponse.json();
    return newsData.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

async function getWeather(city) {
  try {
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=607439218ac641948b31a03263bef4b2&units=metric`);
    const weatherData = await weatherResponse.json();
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

async function getMovies() {
  try {
    const moviesResponse = await fetch('https://api.themoviedb.org/3/movie/popular?api_key=b4e8f247cea466a8f62f608a5bb956a1');
    const moviesData = await moviesResponse.json();
    return moviesData.results;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

module.exports = {
  getNews,
  getWeather,
  getMovies
};
