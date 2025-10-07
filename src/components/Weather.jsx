// src/components/Weather.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
} from "react-icons/wi";

// Weather icons mapping
const weatherIcons = {
  0: <WiDaySunny className="text-yellow-400 animate-bounce-slow" />,
  1: <WiCloud className="text-gray-400 animate-float" />,
  2: <WiCloud className="text-gray-400 animate-float" />,
  3: <WiCloud className="text-gray-400 animate-float" />,
  45: <WiFog className="text-gray-500 animate-fade" />,
  48: <WiFog className="text-gray-500 animate-fade" />,
  51: <WiRain className="text-blue-400 animate-rain" />,
  53: <WiRain className="text-blue-400 animate-rain" />,
  55: <WiRain className="text-blue-400 animate-rain" />,
  61: <WiRain className="text-blue-600 animate-rain" />,
  63: <WiRain className="text-blue-600 animate-rain" />,
  65: <WiRain className="text-blue-600 animate-rain" />,
  71: <WiSnow className="text-white animate-snow" />,
  73: <WiSnow className="text-white animate-snow" />,
  75: <WiSnow className="text-white animate-snow" />,
  95: <WiThunderstorm className="text-purple-500 animate-flash" />,
  99: <WiThunderstorm className="text-purple-500 animate-flash" />,
};

// Convert 24h to 12h AM/PM
const formatTime = (date) => {
  let hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours} ${ampm}`;
};

const Weather = ({ latitude, longitude }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (latitude && longitude) {
      setLoading(true);
      axios
        .get(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode,windspeed_10m,winddirection_10m&current_weather=true`
        )
        .then((res) => {
          const data = res.data;
          setWeatherData(data.current_weather);

          const now = new Date();
          const currentHour = now.getHours();
          const hourlyTime = data.hourly.time;
          const temperature = data.hourly.temperature_2m;
          const weathercode = data.hourly.weathercode;
          const windspeed = data.hourly.windspeed_10m;
          const winddir = data.hourly.winddirection_10m;

          let next24 = [];
          for (let i = 0; i < 24; i++) {
            const idx = (currentHour + i) % 24;
            next24.push({
              time: new Date(hourlyTime[idx]),
              temp: temperature[idx],
              code: weathercode[idx],
              windspeed: windspeed[idx],
              winddir: winddir[idx],
            });
          }
          setHourlyData(next24);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch weather data.");
          setLoading(false);
        });
    }
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow text-center font-semibold">
        {error}
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden border border-cyan-300"
    >
      {/* Current Weather */}
      <div className="bg-gradient-to-r from-cyan-100 via-blue-100 to-indigo-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <h3 className="text-3xl font-bold text-blue-700 mb-2 animate-pulse">
            Current Weather
          </h3>
          <p className="text-gray-700 font-medium text-lg">
            Temperature:{" "}
            <span className="text-2xl font-bold text-indigo-600">
              {weatherData.temperature}°C
            </span>
          </p>
          <p className="text-gray-700 font-medium text-lg">
            Wind:{" "}
            <span className="text-xl font-bold text-indigo-600">
              {weatherData.windspeed} km/h
            </span>{" "}
            | Direction:{" "}
            <span className="text-xl font-bold text-indigo-600">
              {weatherData.winddirection}°
            </span>
          </p>
          <p className="text-gray-600 mt-1">
            Weather Code: {weatherData.weathercode}
          </p>
        </div>
        <div className="text-6xl">
          {weatherIcons[weatherData.weathercode] || (
            <WiDaySunny className="text-yellow-400 animate-bounce-slow" />
          )}
        </div>
      </div>

      {/* 24-Hour Scrollable Timeline */}
      <div className="p-4 bg-gray-50">
        <h4 className="text-xl font-semibold text-blue-700 mb-4 text-center">
          Hourly Forecast (Next 24h)
        </h4>
        <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200 py-2">
          {hourlyData.map((hour, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="relative min-w-[90px] flex-shrink-0 bg-gradient-to-b from-blue-100 to-cyan-50 rounded-2xl p-3 flex flex-col items-center shadow-md cursor-pointer group transition-transform"
            >
              <span className="text-sm font-medium text-gray-700 mb-1">
                {formatTime(hour.time)}
              </span>
              <div className="text-3xl mb-1">
                {weatherIcons[hour.code] || (
                  <WiDaySunny className="text-yellow-400 animate-bounce-slow" />
                )}
              </div>
              <span className="font-bold text-gray-800">{hour.temp}°C</span>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 w-36 bg-white text-gray-800 p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 text-xs">
                <p>
                  <span className="font-semibold">Wind:</span> {hour.windspeed} km/h
                </p>
                <p>
                  <span className="font-semibold">Direction:</span> {hour.winddir}°
                </p>
                <p>
                  <span className="font-semibold">Weather Code:</span> {hour.code}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Weather;
