const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'see') {
        const url = options.getString('url');

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return interaction.reply('Please provide a valid URL starting with http or https.');
        }

        try {
            await interaction.deferReply(); // Indique que la réponse prendra du temps

            // Configuration de Puppeteer pour Replit
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            // Enregistrer la capture d'écran dans un fichier
            const screenshotPath = path.join(__dirname, 'screenshot.png');
            await page.screenshot({ path: screenshotPath });
            await browser.close();

            // Créer un attachement Discord à partir du fichier
            const attachment = new AttachmentBuilder(screenshotPath);

            // Envoyer l'image à Discord
            await interaction.editReply({ files: [attachment] });

            // Supprimer le fichier après l'envoi
            fs.unlinkSync(screenshotPath);
        } catch (error) {
            console.error('Error taking screenshot:', error);
            await interaction.editReply('Failed to take a screenshot. Please try again later.');
        }
    }
});



client.login("MTMwNjc0NDIwODQ0MjUyMzc0MQ.GYeHAU.VV0kgsua3J2cNcKuwTuYEleM8fssNYzuh2pEpE");
