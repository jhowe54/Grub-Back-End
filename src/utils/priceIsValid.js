//util price validation function for isValidDish() in "src/dishes/dishes.controller"
function priceIsValid(price) {
    if(price && typeof price === "number" && price > 0 ) {
        return true;
    } else {
        return false;
    }
}

module.exports = priceIsValid;