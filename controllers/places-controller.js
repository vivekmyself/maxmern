const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");

const getCoOrdsForAddress = require("../util/location");

// let DUMMY_PLACES = [
//   {
//     id: "p1",
//     title: "Empire State",
//     description: "Empire State Building world famous",
//     imageURL:
//       "https://untappedcities.com/wp-content/uploads/2015/07/Flatiron-Building-Secrets-Roof-Basement-Elevator-Sonny-Atis-GFP-NYC_5.jpg",
//     address: "2 Mannar St, NY",
//     location: {
//       lat: 40.7484405,
//       lng: -73.9878531
//     },
//     creator: "u1"
//   },
//   {
//     id: "p2",
//     title: "Empire State OK",
//     description: "Empire State Building world famous",
//     imageURL: "https://cdn.getyourguide.com/img/tour_img-1739965-148.jpg",
//     address: "5 Mannar St, NY",
//     location: {
//       lat: 40.7484405,
//       lng: -73.9878531
//     },
//     creator: "u2"
//   }
// ];

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  // const place = DUMMY_PLACES.find(p => {
  //   return p.id === placeId;
  // });

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, not able to find place",
      500
    );
    return next(error);
  }
  if (!place) {
    //return res.status(404).json({ message: "Data not found for the place" });
    // const error = new Error("Could not find the date looking for places");
    // error.code = 404;
    // throw error; // for synchornose code
    //  next(error); //for asynchornos code

    const error = new HttpError(
      "Could not find the date looking for places",
      404
    );
    return next(error);
  }
  // res.json({ place: place.toObject({ getters: true }) });
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // const places = DUMMY_PLACES.filter(p => {
  //   return p.creator === userId;
  // });
  //let places;
  let userWithPlaces;
  try {
    //places = await Place.find({ creator: userId });
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    const error = new HttpError("Couldnt find the place for the user", 500);
    return next(error);
  }

  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    // return res
    //   .status(404)
    //   .json({ message: "Data not found for the place for the provided user" });
    // const error = new Error("Could not find the date looking for user id");
    // error.code = 404;
    // return next(error); //for asynchornos code
    return next(
      new HttpError("Could not find the date looking for user id", 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, check the data", 422));
  }
  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoOrdsForAddress(address);
  } catch (error) {
    return next(error);
  }

  // const createdPlace = {
  //   id: uuid(),
  //   title,
  //   description,
  //   address,
  //   creator,
  //   location: coordinates
  // };

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvJIvT7ux5ZSwFalNrwWyMi3nDJPZvcL5sauBl6qNA4Q8dEcte&s",
    creator
  });

  //DUMMY_PLACES.push(createdPlace); //unshift()

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating place failed", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user", 404);
    return next(error);
  }

  try {
    //await createdPlace.save();
    const newSession = await mongoose.startSession();
    newSession.startTransaction();
    await createdPlace.save({ session: newSession });
    user.places.push(createdPlace);
    await user.save({ session: newSession });
    await newSession.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating place failed", 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, check the updating data", 422)
    );
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;
  // const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
  // const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Could not updated place", 500);
    return next(error);
  }

  place.title = title;
  place.description = description;
  // DUMMY_PLACES[placeIndex] = updatedPlace;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError("Oops Could not updated place", 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  // if (!DUMMY_PLACES.find(p => p.id === placeId)) {
  //   throw new HttpError("Place not found to execute delete", 404);
  // }
  // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
  let place;
  try {
    place = await (await Place.findById(placeId)).populate("creator");
  } catch (err) {
    const error = new HttpError("Oops Could not delete place", 500);
    return next(error);
  }

  if (place) {
    const error = new HttpError("Oops Could not find the place", 404);
    return next(error);
  }

  try {
    //await place.remove();
    const newSession = await mongoose.startSession();
    newSession.startTransaction();
    await place.remove({ session: newSession });
    place.creator.places.pull(place);
    await place.creator.save({ session: newSession });
    await newSession.commitTransaction();
  } catch (err) {
    const error = new HttpError("Oops Could not updated place", 500);
    return next(error);
  }
  res.status(200).json({ message: "Done its deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
