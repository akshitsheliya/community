import { Router } from "express";
import { addBusiness, getAllBusinesses, getBusinessByUUID, updateBusiness, deleteBusiness, getAllBusinessCategories  } from "../controllers/businessController";
import { verifyToken } from "../middleware/authMiddleware";
import { uploadBusinessMedia } from "../middleware/multerMiddleware";

const router = Router();

router.get("/business", verifyToken, getAllBusinesses);
router.get("/business/:business_uuid", verifyToken, getBusinessByUUID);
router.post("/business", verifyToken, uploadBusinessMedia, addBusiness);
router.put("/business/:business_uuid", verifyToken, uploadBusinessMedia, updateBusiness);
router.delete("/business/:business_uuid", verifyToken, deleteBusiness);
router.get("/business-categories", verifyToken, getAllBusinessCategories);

export default router;