export const errorMessages = {
  UNEXPECTED_ERROR: 'Unexpected Error',
  INCORRECT_DETAILS: 'Invalid email or password',
  INVALID_TOKEN: 'Invalid token. Please provide a valid authentication token.',
  USER_UNAUTHORIZED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED_REQUEST: 'Unauthorized request.',
  PERMISSION_DENIED: 'You do not have permission to access this resource.',
  NOT_FOUND: 'not found.',
};

/**
 * Description - Constant Success Messages
 */
export const successMessages = {
  USER_LOGGED_IN: 'User logged in successfully.',
  ADMIN_LOGGED_IN: 'Admin logged in successfully.',
  SUCCESSFULLY_CREATED: 'created successfully.',
  SUCCESSFULLY_BOOKED: 'booked successfully.',
  SUCCESSFULLY_GET_LIST: 'list get successfully',
};

/**
 * Description - Constant Validation Messages
 */
export const validationMessages = {
  NAME_IS_ALPHA: 'Invalid input. Special characters or numbers are not allowed in the name',
  IS_NOT_ALPHA: 'Invalid input. Special characters or numbers are not allowed in the ##',
  PASSWORD_IS_VALID:
    'Password should contain minimum 8 characters 1 small letter or capital letter , 1 number and 1 special characters',
  NOT_EMPTY: 'should not be empty.',
  INVALID_STRING: 'should be in string.',
};

/**
 * Description - Common function for required field validation message
 * @param fieldName string
 * @returns Validation message
 */
export const fieldRequired = (fieldName: string): string => {
  return `Invalid input, The field ${fieldName} is required.`;
};

/**
 * Description - Common function for invalid field validation message
 * @param fieldName string
 * @returns Validation message
 */
export const fieldInvalid = (fieldName: string): string => {
  return `${fieldName} is invalid`;
};

/**
 * Description - Common function for minimum length field validation
 * @param fieldName string
 * @param length number
 * @returns Validation message
 */
export const minimumLength = (fieldName: string, length: number): string => {
  return `${fieldName} should have at least ${length} characters`;
};

/**
 * Description - Common function for maximum length field validation
 * @param fieldName string
 * @param length number
 * @returns Validation message
 */
export const maximumLength = (fieldName: string, length: number): string => {
  return `${fieldName} should have maximum ${length} characters`;
};
