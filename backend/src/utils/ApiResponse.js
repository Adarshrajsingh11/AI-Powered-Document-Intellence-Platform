export const ApiResponse = {
  success(res, data = null, status = 200) {
    return res.status(status).json({ success: true, data });
  },
  created(res, data = null) {
    return ApiResponse.success(res, data, 201);
  },
};
