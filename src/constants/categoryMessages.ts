export const CATEGORY_MESSAGES = {
  CATEGORY: {
    CREATED_SUCCESS: "Category created successfully",
    UPDATED_SUCCESS: "Category updated successfully",
    DELETED_SUCCESS: "Category deleted successfully",
    FETCHED_SUCCESS: "Category fetched successfully",
    FETCHED_ALL_SUCCESS: "All categories fetched successfully",
    CATEGORY_NOT_FOUND: "Category not found",
    CATEGORY_ALREADY_EXISTS: "Category with this name already exists",
    CREATION_FAILED: "Failed to create category",
    UPDATE_FAILED: "Failed to update category",
    DELETE_FAILED: "Failed to delete category",
    FETCH_FAILED: "Failed to fetch category",
    CANNOT_DELETE_WITH_PRODUCTS:"Cannot delete category. Products are associated with this category.",
  },

  VALIDATION: {
    CATEGORY_NAME_REQUIRED: "Category name is required",
    CATEGORY_NAME_MIN_LENGTH: "Category name must be at least 3 characters",
    CATEGORY_NAME_MAX_LENGTH: "Category name must not exceed 50 characters",
    CATEGORY_DESCRIPTION_MAX_LENGTH:
      "Description must not exceed 500 characters",
    CATEGORY_ID_REQUIRED: "Category ID is required",
    CATEGORY_ID_INVALID: "Category ID must be a valid number",
  },
};