import TelegramBot from "node-telegram-bot-api";
import "dotenv/config";
import axios from "axios";
const fs = require("fs");
const imgToPDF = require("image-to-pdf");

class LogsBot {
  private bot;
  private token;

  public constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;

    if (!this.token) {
      throw new Error("Token is invalid.");
    }
    this.bot = new TelegramBot(this.token, { polling: true });
  }

  public receiveImage() {
    this.bot.on("photo", async (msg) => {
      if (msg.photo && msg.photo[0]) {
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        console.log(msg.photo[0]);
        const image = await this.bot.getFile(fileId);
        const filePath = image.file_path;
        const downloadURL = `https://api.telegram.org/file/bot${this.token}/${filePath}`;
        console.log(downloadURL);
        let imageData = await axios.get(downloadURL, {
          responseType: "arraybuffer",
        });
        let returnedB64 = Buffer.from(imageData.data).toString("base64");

        const pages = [`data:image/jpeg;base64,${returnedB64}`];
        imgToPDF(pages, imgToPDF.sizes.A4).pipe(
          fs.createWriteStream("output.pdf")
        );

        // Replace 'your_pdf_file.pdf' with the path to your PDF file
        const pdfPath = "output.pdf";

        // Read the PDF file as a buffer
        fs.readFile(pdfPath, (err, data) => {
          if (err) {
            console.error(err);
            return;
          }

          // Convert the buffer to an array buffer

          // Use the Telegram bot API to send the document
          this.bot
            .sendDocument(
              msg.chat.id,
              data,
              {},
              {
                filename: "output.pdf", // Set the filename
                contentType: "application/pdf",
                caption: "Here is your PDF document", // Optional caption
              }
            )
            .then((sent) => {
              console.log("Document sent:", sent);
            })
            .catch((error) => {
              console.error("Error sending document:", error);
            });
        });
      }
    });
  }
}

export const logsBot = new LogsBot();
