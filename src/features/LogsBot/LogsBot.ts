import TelegramBot from "node-telegram-bot-api";
import "dotenv/config";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { deleteGeneratedFiles } from "./LogsBot.utils";
const fs = require("fs");
const imgToPDF = require("image-to-pdf");

class LogsBot {
  private bot;
  private token;
  private imageUrls: string[] = [];
  private imagesReceived = 0;

  public constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;

    if (!this.token) {
      throw new Error("Token is invalid.");
    }
    this.bot = new TelegramBot(this.token, { polling: true });
  }

  public receiveImage() {
    this.bot.on("photo", async (msg) => {
      try {
        this.imagesReceived++;
        if (msg.photo && msg.photo[0]) {
          await this.getImageUrlsAsync(msg);
          console.log(this.imagesReceived);
          const id = await this.generatePDFAsync();
          if (id == null) return;
          await this.sendPDFAsync(msg, id);
          this.clean();
        }
      } catch (error) {
        console.log(error);
        this.bot.sendMessage(msg.chat.id, "An error occurred.");
      }
    });
  }

  private async getImageUrlsAsync(msg: any): Promise<void> {
    const fileId = msg.photo[msg.photo.length - 1].file_id;
    console.log("File id: " + fileId);
    const image = await this.bot.getFile(fileId);
    const filePath = image.file_path;
    const downloadURL = `https://api.telegram.org/file/bot${this.token}/${filePath}`;
    let imageData = await axios.get(downloadURL, {
      responseType: "arraybuffer",
    });
    let returnedB64 = Buffer.from(imageData.data).toString("base64");
    const imageUrl = `data:image/jpeg;base64,${returnedB64}`;
    this.imageUrls.push(imageUrl);
  }

  private async generatePDFAsync(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        if (this.imageUrls.length != this.imagesReceived) return null;
        const pdfId = `${uuidv4()}.pdf`;
        imgToPDF(this.imageUrls, imgToPDF.sizes.A4).pipe(
          fs.createWriteStream(pdfId)
        );
        console.log("PDF generated.");
        resolve(pdfId);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async sendPDFAsync(msg: any, pdfId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          fs.readFile(pdfId, (err, data) => {
            console.log("Reading file.");
            if (err) {
              console.error(err);
              reject(err);
              return;
            }

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
                resolve();
              })
              .catch((error) => {
                console.error("Error sending document:", error);
                reject(error);
              });
          });
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  }

  private clean() {
    this.imageUrls = [];
    this.imagesReceived = 0;
    deleteGeneratedFiles();
  }
}

export const logsBot = new LogsBot();
