const path = require("path");
const priceIsValid = require("../utils/priceIsValid");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");


/*---------------------------------------------------- VALIDATION MIDDLEWARE FUNCTIONS ----------------------------------------------------------------------------------*/

//verify that a dish exists based on the dish's 'id' property 
function dishExists(req, res, next) {
  const dishId = String(req.params.dishId);
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  return next({
    status: 404,
    message: `Could not find dishId: ${dishId}`,
  });
}

//verify that the dish being created or updated has valid properties
function isValidDish(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  if (name && description && priceIsValid(price) && image_url) {
    return next();
  }
  next({
    status: 400,
    message: `The properties "name, description, price, image_url" are required`,
  });
}

/*----------------------------------------------------------ROUTER MIDDLEWARE FUNCTIONS------------------------------------------------------------------------------*/
//create a new dish with a unique id property
function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}
//return a specific dish by its id property
function read(req, res, next) {
  res.json({ data: res.locals.dish });
}
//update an already existing dish
function update(req, res, next) {
  const dish = res.locals.dish
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  
/*
if there is a dish id in the request body and it does not match the dishId path parameter, return a 400 error 
this executes only if there is a dishId in the body so that if the id is not specified, the function can still update the dish based on the 
dishId path parameter
*/
  if (id && id !== dish.id) {
    return next({
      status: 400,
      message: `The inputted dish id : ${req.body.data.id} - does not match the dish you are trying to update - dish id: ${dish.id}`,
    });
  }

  const updatedDish = {
    ...dish,
    id: dish.id,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  
  res.json({ data: updatedDish });
}
//list all dishes
function list(req, res) {
  res.json({ data: dishes });
}



module.exports = {
  create: [isValidDish, create],
  read: [dishExists, read],
  update: [dishExists, isValidDish, update],
  list,
};
