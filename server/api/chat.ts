export default defineEventHandler(async (event) => {
  interface ChatRequest {
    message: string;
  }
  try {
    // Parse the incoming request
    const body: ChatRequest = await readBody(event);
    let {message} = body
    console.log("message", message)
    const response = await fetch(
      "https://cloud.flowiseai.com/api/v1/prediction/34cad011-19bc-4922-9aba-f6002a69168d",
      {
          headers: {
               Authorization: "Bearer ${process.env.FLOWWISE_API_KEY}",
              "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({"question":message})
      }
    );

    const result = await response.json();
   
    return result;
 
  } catch (error) {
    console.error("Error in /api/chat server:", error);
    event.res.statusCode = 500;
    return { reply: "I'm sorry, something went wrong on the server." };
  }
});
