import { Router } from "express";
import { ContactController } from "@controllers/ContactController";
import { authenticate, authorize, validate } from "@middlewares/index";
import {
  createContactValidator,
  updateContactValidator,
  contactIdValidator,
} from "@/utils/validators";
import { UserRole } from "@entities/Profile";

const router = Router();
const adminRouter = Router();
const contactController = new ContactController();

// ============= Public Routes =============
/**
 * @route   POST /api/contact
 * @desc    Create new contact (customer submission)
 * @access  Public
 */
router.post("/", validate(createContactValidator), contactController.createContact);

// ============= Admin Routes =============
/**
 * @route   GET /api/admin/contact
 * @desc    Get all contacts
 * @access  Private (Admin)
 */
adminRouter.get(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  contactController.getAllContacts
);

/**
 * @route   GET /api/admin/contact/:id
 * @desc    Get contact by ID
 * @access  Private (Admin)
 */
adminRouter.get(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(contactIdValidator),
  contactController.getContactById
);

/**
 * @route   PUT /api/admin/contact/:id
 * @desc    Update contact status
 * @access  Private (Admin)
 */
adminRouter.put(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateContactValidator),
  contactController.updateContactStatus
);

/**
 * @route   DELETE /api/admin/contact/:id
 * @desc    Delete contact
 * @access  Private (Admin)
 */
adminRouter.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN),
  validate(contactIdValidator),
  contactController.deleteContact
);

export default router;
export { adminRouter };

