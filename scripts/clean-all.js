const fs = require("node:fs");
const execa = require("execa");
const { join } = require("node:path");

(async () => {
	fs.rmSync(join(__dirname, "/../packages/backend/built"), {
		recursive: true,
		force: true,
	});
	fs.rmSync(join(__dirname, "/../packages/backend/node_modules"), {
		recursive: true,
		force: true,
	});

	fs.rmSync(join(__dirname, "/../packages/client/built"), {
		recursive: true,
		force: true,
	});
	fs.rmSync(join(__dirname, "/../packages/client/node_modules"), {
		recursive: true,
		force: true,
	});

	fs.rmSync(join(__dirname, "/../packages/sw/built"), {
		recursive: true,
		force: true,
	});
	fs.rmSync(join(__dirname, "/../packages/sw/node_modules"), {
		recursive: true,
		force: true,
	});
	fs.rmSync(join(__dirname, "/../packages/iceshrimp-sdk/built"), {
		recursive: true,
		force: true,
	});
	fs.rmSync(join(__dirname, "/../packages/iceshrimp-sdk/node_modules"), {
		recursive: true,
		force: true,
	});

	fs.rmSync(join(__dirname, "/../built"), { recursive: true, force: true });
	fs.rmSync(join(__dirname, "/../node_modules"), {
		recursive: true,
		force: true,
	});

	execa("yarn", ["clean"], {
		cwd: join(__dirname, "/../"),
		stdio: "inherit",
	});
})();
