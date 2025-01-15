import { fastifyCors } from "@fastify/cors";
import { fastify } from "fastify";

const server = fastify();

server.register(fastifyCors, { origin: "*" });

server.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
	console.log("Server is running on port 3333: http://localhost:3333");
});
