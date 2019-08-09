import fetch from "node-fetch";



const server = process.env.HTTPEXEC_SERVER as string;
const token = process.env.HTTPEXEC_TOKEN as string;
const command = process.argv.slice(2);

const stream = {
	out: process.stdout,
	err: process.stderr,
};


fetch(server.replace(/\/?$/, "/exec"), {
	method: "POST",
	headers: {
		"Authorization": "Bearer " + token,
		"Content-Type": "application/json",
	},
	body: JSON.stringify({
		command
	}),
}).then(res => {

	if (res.status !== 202) {
		stream.err.write("HTTPEXEC: Unexpected server response: ");
		stream.err.write( res.status + " " + res.statusText + "\n");
		process.exit(255);
		return;
	}

	res.body.on("data", (data: Buffer) => {
		buffer = Buffer.concat([buffer, data]);
		flushBuffer();
	});

	res.body.on("finish", () => {
		flushBuffer();
		flushCode();
	});

	let buffer = Buffer.alloc(0);
	let mode: "out" | "err" | "res" | string | undefined = undefined;

	const flushBuffer = () => {
		for (;;) {
			if (mode === undefined) {
				const colonPos = buffer.indexOf(":", 0, "ascii");
				if (colonPos === -1) {
					return;
				}
				mode = buffer.subarray(0, colonPos).toString("ascii");
				buffer = buffer.slice(colonPos + 1);
			} else if (mode === "out" || mode === "err") {
				const posEnd = buffer.indexOf("\n", 0, "ascii");
				if (posEnd === -1) {
					return;
				}
				const data = Buffer.from(buffer.toString("ascii", 0, posEnd), "base64");
				stream[mode].write(data);
				buffer = buffer.slice(posEnd + 1);
				mode = undefined;
			} else if (mode === "res") {
				return;
			} else {
				mode = undefined;
			}
		}
	};

	const flushCode = () => {
		if (mode === "res") {
			const code = parseInt(buffer.toString("ascii").trim(), 10);
			process.exit(code);
		}
	};

});
