const successHandler = (res: any) => {
  const responseData = res?.data?.data ? res.data.data : res.data;

  return {
    success: true,
    data: responseData,
  };
};

const errorHandler = (err: any) => {
  const { request, response } = err;
  if (response) {
    const { message } = response.data;

    return {
      message: message || "something went wrong",
      success: false,
    };
  } else if (request) {
    return {
      message: "server time out",
      success: false,
    };
  } else {
    return {
      message: "opps! something went wrong while setting up request",
      success: false,
    };
  }
};

export { successHandler, errorHandler };