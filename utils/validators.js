const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateRegister = (name, email, password ) => {
    const errors = [];

    if(!name || name.trim() === "") {
        errors.push("Name is required");
    } else if ( name.trim().length < 2) {
        errors.push("Name must be at least 2 characters");
    } else if ( name.trim().length > 50) {
        errors.push("Name must be less than 50 characters");
    }

    if (!email || email.trim() === "") {
        errors.push("Email is required")
    } else if (!emailRegex.test(email)) {
        errors.push("Please enter a valid email");
    }

    if (!password || password.trim() === "") {
        errors.push("Password is required");
    } else if ( password.length < 6) {
        errors.push("Password must be atleast 6 characters long");
    }

    return errors;

};

const validateProduct = ( name, price, stock, category, description) => {

    const errors = [];

    if (!name || name.trim() === "") {
        errors.push("Name is required");
    } else if ( name.trim().length < 3) {
        errors.push("Name must be atleast 3 characters");
    }

    if ( price === undefined || price === null || price === "") {
        errors.push("Price required");
    } else if (isNaN(price)) {
        errors.push("Price must be Number");
    } else if (Number(price) <= 0) {
        errors.push("Price must be positive number")

    }

    if ( stock === undefined || stock === null || stock === "") {
        errors.push("Stock required")
    } else if (isNaN(stock)) {
        errors.push("Stock must be a Number")
    } else if (Number(stock) < 0) {
        errors.push("Stock must be greater than 0")
    }

    if (!category || category.trim() === "") {
        errors.push("category required");
    }

    if (!description || description.trim() === "") {
        errors.push("description required");
    }

    return errors;
};

module.exports = { validateRegister, validateProduct};