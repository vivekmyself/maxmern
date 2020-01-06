const HttpError = require("../models/http-error");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State",
    description: "Empire State Building world famous",
    imageURL:
      "https://untappedcities.com/wp-content/uploads/2015/07/Flatiron-Building-Secrets-Roof-Basement-Elevator-Sonny-Atis-GFP-NYC_5.jpg",
    address: "2 Mannar St, NY",
    location: {
      lat: 40.7484405,
      lng: -73.9878531
    },
    creator: "u1"
  },
  {
    id: "p2",
    title: "Empire State OK",
    description: "Empire State Building world famous",
    imageURL: "https://cdn.getyourguide.com/img/tour_img-1739965-148.jpg",
    address: "5 Mannar St, NY",
    location: {
      lat: 40.7484405,
      lng: -73.9878531
    },
    creator: "u2"
  }
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find(p => {
    return p.id === placeId;
  });
  if (!place) {
    //return res.status(404).json({ message: "Data not found for the place" });
    // const error = new Error("Could not find the date looking for places");
    // error.code = 404;
    // throw error; // for synchornose code
    //  next(error); //for asynchornos code

    throw new HttpError("Could not find the date looking for places", 404);
  }
  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter(p => {
    return p.creator === userId;
  });
  if (!places || places.length == 0) {
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

  res.json({ places });
};

const createPlace = (req, res, next) => {
  const { title, description, coordinates, address, creator } = req.body;

  const createdPlace = {
    title,
    description,
    address,
    creator,
    location: coordinates
  };

  DUMMY_PLACES.push(createdPlace); //unshift()

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const { title, description } = req.body;
  const placeId = req.params.pid;
  const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;
  DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
  res.status(200).json({ message: "Done its deleted" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
