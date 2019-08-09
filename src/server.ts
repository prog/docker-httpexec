import bearerToken from "express-bearer-token";
import bodyParser from "body-parser";
import cp from "child_process";
import express, { Request } from "express";



const token = process.env.HTTPEXEC_TOKEN as string;

const app = express();
const jsonBodyParser = bodyParser.json();
const bearerTokenMiddleware = bearerToken();


// disable Keep-Alive
app.use((req, res, next) => {
	res.setHeader("Connection", "close");
	next();
});


app.post("/exec", jsonBodyParser, bearerTokenMiddleware, (req, res) => {

	if (!isRequestWithToken(req) || req.token !== token) {
		res.status(401).send("Unauthorized");
		return;
	}

	const [command, ...args] = req.body.command;

	console.log(timestamp() + " - exec: " + JSON.stringify(req.body));
	const headers = {
		"Content-Type": "text/plain",
		"Cache-control": "no-cache"
	};

	res.writeHead(202, headers);
	res.flushHeaders();

	const proc = cp.spawn(command, args);
	proc.stdout.on("data", (data: Buffer) => res.write("out:" + data.toString("base64") + "\n"));
	proc.stderr.on("data", (data: Buffer) => res.write("err:" + data.toString("base64") + "\n"));
	proc.on("close", code => res.end("res:" + code));
	req.connection.on("close", () => proc.kill("SIGINT"));
});


const server = app.listen(8080, () => {
	console.log(timestamp() + " # Server Started");
});


process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());


let shutdown = () => {
	shutdown = () => process.exit(0);

	console.log(timestamp() + " # Graceful shutdown...");
	server.close(() => console.log(timestamp() + " # Server closed."));
};


const isRequestWithToken = (r: Request): r is (Request & { token: string }) =>
	(typeof ((r as any).token) === "string");

const timestamp = () => new Date().toISOString();
