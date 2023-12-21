import { logsBot } from "./features/LogsBot/LogsBot";

function main() {
  console.log("LogsBot waiting for messages...");
  logsBot.sendInstructions();
  logsBot.receiveImage();
}

main();
