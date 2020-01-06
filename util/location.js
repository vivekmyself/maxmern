const axios = require("axios");

const HttpError = require("../models/http-error");

const API_KEY = "abc";

async function getCoOrdsForAddress(address) {
  return {
    lat: 40.7484405,
    lng: -73.9878531
  };
  // const responce = await axios.get(
  //   `https://maps.google.com/json?address=${encodeURIComponent}&KEY=${API_KEY}`
  // );

  // const data = responce.data;
  // if (!data || data.status === "ZERO_RESULTS") {
  //   const error = new HttpError("Could not find the location", 422);
  //   throw error;
  // }

  // const coordinates = data.results[0].geometry.location;

  // return coordinates;
}

module.exports = getCoOrdsForAddress;
