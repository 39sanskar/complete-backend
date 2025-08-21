const asyncHandler = (requestHandler) => {
  // accept as a function and return as a function
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
  };
};


export { asyncHandler };






/*
// Another way (Higher Order function)

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {} 
// const asyncHandler = (func) => async () => {}  


const asyncHandler = (fn) => async (req, res, next) => {
  try {
      await fn(req, res, next)
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: err.message
    })
  }
}

*/