import { fastifyCors } from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";
import fastifySwagger from "@fastify/swagger";
import { fastify } from "fastify";
import {
	hasZodFastifySchemaValidationErrors,
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import { uploadImageRoute } from "./routes/upload-image";
import fastifySwaggerUi from "@fastify/swagger-ui";

const server = fastify();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler((error, _request, reply) => {
	if (hasZodFastifySchemaValidationErrors(error)) {
		return reply.code(400).send({
			message: "Validation error",
			issues: error.validation,
		});
	}

	// send error to -> (sentry|datadog|grafana|OTel|etc)
	console.error(error);

	return reply.code(500).send({ message: "Internal server error" });
});

server.register(fastifyCors, { origin: "*" });
server.register(fastifyMultipart);
server.register(fastifySwagger, {
	openapi: {
		info: {
			title: "Upload Server",
			version: "1.0.0",
		},
	},
	transform: jsonSchemaTransform,
});
server.register(fastifySwaggerUi, {
	routePrefix: "/docs",
})
server.register(uploadImageRoute);

server.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
	console.log("Server is running on port 3333: http://localhost:3333");
});
