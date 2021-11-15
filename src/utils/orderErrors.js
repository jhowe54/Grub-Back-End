//Utility functions for the isValidOrder() function in "src/orders/orders.controller"

/* 
-first checks to make sure that 'dishes' is not empty and is an array
-if dishes is a valid array, check to make sure each dish in the array is a valid dish
*/
function dishesAreValid(dishes) {
  if (dishes.length === 0 || !Array.isArray(dishes)) {
    return false;
  }

  const filterQuantities = dishes.some((dish) => dish.quantity <= 0);
  const filterQuantityType = dishes.some((dish) => typeof dish.quantity !== "number");
  const quantityDoesNotExist = dishes.some((dish) => !dish.quantity);

  if (filterQuantities || filterQuantityType || quantityDoesNotExist) {
    return false;
  } else {
    return true;
  }
}

/* 
This function is primarily responsible for handling the messages returned for an order with invalid dishes. 
*/
function invalidOrderErrors(dishes) {
  const quantityDoesNotExist = dishes.find((dish) => !dish.quantity);

  if (quantityDoesNotExist) {
    const index = dishes.indexOf(dishes.find((dish) => !dish.quantity));
    return `Dish ${index} must have a quantity that is an integer greater than 0.`;
  }
  //only check if quantity if <= 0 or not an integer if the quantity actually exists
  if (!quantityDoesNotExist) {
    const filterQuantities = dishes.find((dish) => dish.quantity <= 0);
    const filterQuantityType = dishes.find((dish) => typeof dish.quantity !== "number");

    if (filterQuantities) {
      const index = dishes.indexOf(dishes.find((dish) => dish.quantity <= 0));
      return `Dish ${index} must have a quantity that is an integer greater than 0. The received value was ${dishes[index].quantity}`;
    }

    if (filterQuantityType) {
      const index = dishes.indexOf(dishes.find((dish) => typeof dish.quantity !== "number"));
      return `Dish ${index} must have a quantity that is an integer greater than 0. The received value: ${dishes[index].quantity}  is a non-integer`;
    }
  }

  return "Orders must have a deliverTo, mobileNumber, dishes, and status property ";
}

module.exports = { dishesAreValid, invalidOrderErrors };
