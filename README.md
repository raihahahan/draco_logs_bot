# Draco logs bot
## Telegram bot for NUS RC4 Draco House Logs comm

### What is it
- Logistics are needed for house events
- Proof of purchase and receipts need to be compiled into a single pdf file for tracking and admin purposes
- This bot simplifies the process by converting multiple images of the items required into a single pdf file

### Requirements
- Nodejs

### Setting up locally
1. Clone this repo: `https://github.com/raihahahan/draco_logs_bot.git`
2. From the root directory: `npm install`
3. Create a new bot using Telegram's BotFather
4. Create a new `.env` file and copy the required key from `.env.example`. Paste the generated token into the `.env` file
5. Run the project: `npm run dev`

### How to use
1. Go to the bot and call /start
2. Select one or more images from your gallery

### Roadmap
- [ ] Dockerise the bot
- [ ] Issue: Sending in a large number of images will cause the bot to generate multiple pdfs separately as it does not wait for all images to load. Should consider to have a way to control the start and end of images using commands
