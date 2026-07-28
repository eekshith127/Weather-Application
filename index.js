import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();

const port = process.env.PORT || 3000;

const geoapifyApiURL = "https://api.geoapify.com/v1/geocode/search";
const geoapifyApiKey = process.env.GEOAPIFY_API_KEY;

const openWeatherApiURL = "https://api.openweathermap.org/data/2.5/weather";
const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/get-weather", async (req, res) => {
    console.log(req.body);
    const city = req.body.city;
    const state = req.body.state;
    const country = req.body.country;
    var location;
    var lat, lon;
    try {
        const result = await axios.get(geoapifyApiURL + `?city=${city}&state=${state}&country=${country}&limit=5&apiKey=${geoapifyApiKey}`);
        console.log(result.data);
        console.log(geoapifyApiURL + `?city=${city}&state=${state}&country=${country}&limit=5&apiKey=${geoapifyApiKey}`);

        if (result.data.features.length === 0) {
            return res.send("No matching location found.");
        }
        lat = result.data.features[0].properties.lat;
        lon = result.data.features[0].properties.lon;
        location = result.data.features[0].properties.formatted;
        console.log(lat);
        console.log(lon);
    } catch (error) {
        console.log(error.response?.data || error.message);
        return res.send("Location not found.");
    }

    try {
        console.log(openWeatherApiURL + `?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`);
        const weather = await axios.get(openWeatherApiURL, {
            params: {
                lat,
                lon,
                units: "metric",
                appid: openWeatherApiKey,
            },
        });
        const icon = weather.data.weather[0].icon;
        const iconURL = `https://openweathermap.org/img/wn/${icon}@4x.png`;
        res.render("weather.ejs", {
            weather: weather.data,
            iconURL: `https://openweathermap.org/img/wn/${weather.data.weather[0].icon}@4x.png`,
            location: location,
        });
    } catch (error) {
        console.log(error.response?.data || error.message);
    }
});
app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
