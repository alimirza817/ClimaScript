let cityInput = document.getElementById('city_input'),
    searchBtn = document.getElementById('searchBtn'),
    locationBtn = document.getElementById('locationBtn'),
    api_key = '5ff5a3c783522defa0068148abcd6417';

let fiveDaysForcastCard = document.querySelector('.day-forecast');
let currentWeatherCard = document.querySelector('.weather-left .card');
let aqiCard = document.querySelectorAll('.highlights .card')[0];
let sunriseCard = document.querySelectorAll('.highlights .card')[1]; // ✅ 2nd card for sunrise/sunset

let humidityVal = document.getElementById('humidityVal'),
    pressureVal = document.getElementById('pressureVal'),
    visibilityVal = document.getElementById('visibilityVal'),
    windSpeedVal = document.getElementById('windSpeedVal'),
    feelsVal = document.getElementById('feelsVal');

let hourlyForecastCard = document.querySelector('.hourly-forecast'); // ✅ FIX selector

function getWeatherDetails(name, lat, lon, country, state) {
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`,
        WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`,
        AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`;

    let aqilist = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // 🌫 Air Pollution Data
    fetch(AIR_POLLUTION_API_URL)
        .then(res => res.json())
        .then(data => {
            let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;
            let aqiIndex = data.list[0].main.aqi; // 1–5

            aqiCard.innerHTML = `
              <div class="card-head">
                  <p>Air Quality Index</p>
                  <p class="air-index aqi-${aqiIndex}">${aqilist[aqiIndex - 1]}</p>
              </div>
              <div class="air-indicates">
                  <i class="fa-solid fa-wind fa-3x"></i>
                  <div class="item"><p>PM2.5</p><h2>${pm2_5}</h2></div>
                  <div class="item"><p>PM10</p><h2>${pm10}</h2></div>
                  <div class="item"><p>SO2</p><h2>${so2}</h2></div>
                  <div class="item"><p>CO</p><h2>${co}</h2></div>
                  <div class="item"><p>NO</p><h2>${no}</h2></div>
                  <div class="item"><p>NO2</p><h2>${no2}</h2></div>
                  <div class="item"><p>NH3</p><h2>${nh3}</h2></div>
                  <div class="item"><p>O3</p><h2>${o3}</h2></div>
              </div>
            `;
        })
        .catch(() => {
            alert("Failed to fetch Air Quality Index");
        });

    // 🌤 Current Weather + Sunrise/Sunset
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            let date = new Date();

            currentWeatherCard.innerHTML = `
              <div class="current-weather">
                   <div class="details">
                     <p>Now</p>
                     <h2>${data.main.temp.toFixed(1)}&deg;C</h2>
                     <p>${data.weather[0].description}</p>
                   </div>

                 <div class="weather-icon">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
                 </div>
              </div>
              <hr>
              <div class="card-footer">
                  <p><i class="fa-solid fa-calendar"></i> 
                    ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}
                  </p>
                  <p><i class="fa-solid fa-location-dot"></i> ${name}, ${country}</p>
              </div>
            `;

            // ✅ Sunrise & Sunset
            let { sunrise, sunset } = data.sys;
            let { timezone, visibility } = data;
            let { humidity, pressure, feels_like } = data.main;
            let { speed } = data.wind;

            let sRiseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A');
            let sSetTime = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm A');

            sunriseCard.innerHTML = `
              <div class="card-head">
                <p>Sunrise & Sunset</p>
              </div>
              <div class="sunrise-sunset">
                <div class="item">
                  <div class="icon">
                    <i class="fa-solid fa-arrow-up fa-2x" style="color: orange;"></i>
                  </div>
                  <div>
                    <p>Sunrise</p>
                    <h2>${sRiseTime}</h2>
                  </div>
                </div>
                <div class="item">
                  <div class="icon">
                    <i class="fa-solid fa-arrow-down fa-2x" style="color: red;"></i>
                  </div>
                  <div>
                    <p>Sunset</p>
                    <h2>${sSetTime}</h2>
                  </div>
                </div>
              </div>
            `;

            // ✅ Fill extra values
            humidityVal.innerHTML = `${humidity}%`;
            pressureVal.innerHTML = `${pressure} hPa`;
            visibilityVal.innerHTML = `${(visibility / 1000).toFixed(1)} km`;
            windSpeedVal.innerHTML = `${speed} m/s`;
            feelsVal.innerHTML = `${feels_like.toFixed(1)}°C`;
        })
        .catch(() => {
            alert('Failed to fetch current weather');
        });

    // 📅 Forecast
    fetch(FORECAST_API_URL)
        .then(res => res.json())
        .then(data => {
            let hourlyForecast = data.list;
            hourlyForecastCard.innerHTML = '';

            // ✅ First 8 (24 hours) forecast
            for (let i = 0; i < 8; i++) {
                let hrForecastDate = new Date(hourlyForecast[i].dt_txt);
                let hr = hrForecastDate.getHours();
                let ampm = hr >= 12 ? 'PM' : 'AM';
                hr = hr % 12 || 12;

                hourlyForecastCard.innerHTML += `
                  <div class="card">
                    <p>${hr} ${ampm}</p>
                    <img src="https://openweathermap.org/img/wn/${hourlyForecast[i].weather[0].icon}.png" alt="">
                    <p>${hourlyForecast[i].main.temp.toFixed(1)}&deg;C</p>
                  </div>
                `;
            }

            // ✅ Unique 5 days
            let uniqueForecastDays = [];
            let fiveDaysForcast = data.list.filter(forecast => {
                let forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            fiveDaysForcastCard.innerHTML = '';
            for (let i = 1; i < fiveDaysForcast.length; i++) { // skip today
                let date = new Date(fiveDaysForcast[i].dt_txt);
                fiveDaysForcastCard.innerHTML += `
                  <div class="forecast-item">
                      <div class="icon-wrapper">
                          <img src="https://openweathermap.org/img/wn/${fiveDaysForcast[i].weather[0].icon}.png" alt="">
                          <span>${fiveDaysForcast[i].main.temp.toFixed(1)}&deg;C</span>
                      </div>
                      <p>${days[date.getDay()]}</p>
                      <p>${date.getDate()} ${months[date.getMonth()]}</p>
                      <p>${fiveDaysForcast[i].weather[0].description}</p>
                  </div>
                `;
            }
        })
        .catch(() => {
            alert('Failed to fetch forecast');
        });
}

function getCityCoordinates() {
    let cityName = cityInput.value.trim();
    cityInput.value = '';
    if (!cityName) return;

    let GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) {
                alert("City not found!");
                return;
            }
            let { name, lat, lon, country, state } = data[0];
            getWeatherDetails(name, lat, lon, country, state);
        })
        .catch(() => {
            alert(`Failed to fetch coordinates of ${cityName}`);
        });
}

function getUserCoordinates() {
    navigator.geolocation.getCurrentPosition(position => {
        let { latitude, longitude } = position.coords;
        let REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_key}`;

        fetch(REVERSE_GEOCODING_URL)
            .then(res => res.json())
            .then(data => {
                if (!data || data.length === 0) {
                    alert("Failed to get location name");
                    return;
                }
                let { name, country, state } = data[0];
                getWeatherDetails(name, latitude, longitude, country, state);
            })
            .catch(() => {
                alert('Failed to fetch user coordinates');
            });

    }, error => {
        if (error.code == error.PERMISSION_DENIED) {
            alert('Location permission denied. Please enable it and try again.');
        }
    });
}

searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getUserCoordinates); // ✅ FIXED
