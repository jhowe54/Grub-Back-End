const path = require("path");
const {dishesAreValid, invalidOrderErrors} = require("../utils/orderErrors")

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// check if an order exists based on the order's ID
function orderExists(req, res, next) {
    const orderId = String(req.params.orderId);
    const foundOrder = orders.find((order) => order.id === orderId);

    if(foundOrder) {
        res.locals.order = foundOrder;
        return next()
    }
    return next({
        status: 404,
        message: `Could not find orderId: ${orderId}`,
    })
}


/*
  validates both new orders and updated orders. 
  validation for updated orders contains the same validations as new orders but also checks if there is a valid "status property"
*/
function isValidOrder(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes, status} = {} } = req.body;
    if(!dishes || !Array.isArray(dishes)) {
        return next({
            status: 400,
            message: "dishes is a required property and must be an array"
        })
    }

    if(status && status === "invalid") {
        return next({
            status: 400,
            message:"Invalid status"
        })
    }
    
    if (req.method=== "POST" && deliverTo && mobileNumber && dishesAreValid(dishes)) {
      return next();
    }
    if (req.method=== "PUT" && deliverTo && mobileNumber && dishesAreValid(dishes) && status) {
        return next();
      }
    next({
      status: 400,
      message: invalidOrderErrors(dishes),
    });
  }

//creates new order and assigns a unique id
function create(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;
    const newOrder = {
      id: nextId(),
      deliverTo: deliverTo,
      mobileNumber: mobileNumber,
      status: status,
      dishes: dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
  }

  //returns a specific order by ID
function read(req, res) {
    res.json({data: res.locals.order});
}

//updates an existing order
function update(req, res, next) {
    const { data: { id, deliverTo, mobileNumber, dishes, status } = {} } = req.body;
    const orderId = res.locals.order.id;
    const foundOrder = orders.find((order) => order.id === orderId);
//if the body of the request contains an id property, the id must match the orderId parameter
    if (id && id !== orderId) {
      return next({
        status: 400,
        message: `The inputted order id : ${req.body.data.id} - does not match the order you are trying to update - order id: ${foundOrder.id}`,
      });
    }
  
    const updatedOrder = {
      ...foundOrder,
      id: res.locals.order.id,
      deliverTo: deliverTo,
      mobileNumber: mobileNumber,
      dishes: dishes,
      status: status,
    };
  
    res.json({ data: updatedOrder });
}

//deletes an order 
function destroy(req, res, next) {
    const orderId = String(req.params.orderId);
    const orderStatus = orders.find((order) => order.id === orderId);
    const index = orders.findIndex((order) => order.id === orderId);
    
    if (index > -1 && orderStatus.status === "pending") {
        orders.splice(index, 1);
        return res.sendStatus(204);
    } 
    if (orderStatus.status !== "pending")
    return next({
        status: 400,
        message: "Order status must be pending to delete"
    })
    
}

//list all orders
function list(req, res) {
    res.json({data: orders});
}

module.exports = {
    create: [isValidOrder, create],
    read: [orderExists, read],
    update: [orderExists, isValidOrder, update],
    delete: [orderExists, destroy],
    list,

}

