exports.handler = async (event, context) => {
  const { identity } = context.clientContext;

  if (!identity) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Authorized" }),
  };
};