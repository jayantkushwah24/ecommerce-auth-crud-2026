const getApiErrorMessage = (error, fallback) => {
  const responseData = error.response?.data;
  const validationErrors = responseData?.errors;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors
      .map((validationError) => validationError.msg)
      .filter(Boolean)
      .join(". ");
  }

  return (
    responseData?.message ||
    (error.code === "ERR_NETWORK"
      ? "Unable to connect to the server. Check your connection and try again."
      : error.message) ||
    fallback
  );
};

export default getApiErrorMessage;
