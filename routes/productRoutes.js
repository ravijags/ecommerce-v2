const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");


const protect = require("../middleware/authMiddleware");
const { body } = require("express-validator");

const {
    getAllProducts,
    getOneProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
} = require("../controllers/productController");

const productValidation = [
    body("name")
      .notEmpty().withMessage("Name is required")
      .isLength({ min: 3}).withMessage("Name must be atleast 3 characters"),
    
    body("description")
      .notEmpty().withMessage("Description is required"),
    
    body("price")
      .notEmpty().withMessage("Price is required")
      .isNumeric().withMessage("Price must be a number")
      .custom(value => {
        if(value <=0) {
            throw new Error("Price must be greater than 0");
        }
        return true;
      }),
    
    body("stock")
      .notEmpty().withMessage("Stock required")
      .isNumeric().withMessage("Stock must be a number")
      .custom(value => {
        if(value < 0) {
            throw new Error("Stock must be greater than 0");
        }
        return true;
      }),

    body("category")
      .notEmpty().withMessage("Category is required"),
      
];
router.get("/", getAllProducts);
router.get("/:id", getOneProduct);

router.post("/", protect, productValidation, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);
router.post("/:id/upload", protect, upload.single("image"), uploadProductImage);

module.exports = router;