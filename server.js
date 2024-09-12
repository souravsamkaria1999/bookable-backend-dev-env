if (process.env.NODE_ENV === "development") {
  require("dotenv").config({ path: "./config.dev.env" });
} else {

 require("dotenv").config({ path: "./config.prod.env" });
}

const app = require("./src/app");
const port = process.env.PORT;
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const httpServer = http.createServer(app);
const { typeDefs, resolvers } = require("./src/resolver/resolver-main");
const reraAndInspectionSubscriptionAccessSchedule = require("./src/modules/inspection/jobs/checkSubscriptionStatusJob");
// const userSubscriptionEndDateUpdateSchedule = require("./src/modules/events/jobs/updateUserSubscriptionExpiryJob");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
  formatError: (error) => {
    return {
      code: error.extensions.code,
      message: error.message,
      path: error.path,
      stacktrace: error.extensions.stacktrace,
    };
  },
});

// to Start the Apollo Server
async function startServer() {
  await server.start();
  app.use(
    "/graphql",
    cors(),
    // cors({ origin: ['https://www.your-app.example', 'https://studio.apollographql.com'] }),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const origin = req.headers.origin;
        const token = req.headers["authorization"];
        return { token,origin };
      },
    })
  );
  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer();

module.exports = app;