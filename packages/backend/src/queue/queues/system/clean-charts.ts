import { Job } from "bullmq";
import { queueLogger } from "../../logger.js";
import {
	activeUsersChart,
	driveChart,
	federationChart,
	hashtagChart,
	instanceChart,
	notesChart,
	perUserDriveChart,
	perUserFollowingChart,
	perUserNotesChart,
	perUserReactionsChart,
	usersChart,
	apRequestChart,
} from "@/services/chart/index.js";

const logger = queueLogger.createSubLogger("clean-charts");

export async function cleanCharts(): Promise<string> {
	logger.info("Clean charts...");

	await Promise.all([
		federationChart.clean(),
		notesChart.clean(),
		usersChart.clean(),
		activeUsersChart.clean(),
		instanceChart.clean(),
		perUserNotesChart.clean(),
		driveChart.clean(),
		perUserReactionsChart.clean(),
		hashtagChart.clean(),
		perUserFollowingChart.clean(),
		perUserDriveChart.clean(),
		apRequestChart.clean(),
	]);

	logger.succ("All charts successfully cleaned.");
	return "Success";
}
