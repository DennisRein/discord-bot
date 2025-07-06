const { SlashCommandBuilder } = require('discord.js');
const { AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send-graphic')
        .setDescription('Sende eine Grafik aus dem Emotes und Grafiken channel')
        .addStringOption(option =>
            option
                .setName("text")
                .setDescription("Welcher Text soll auf die Grafik?")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('graphic')
                .setDescription('Welche Grafik?')
                .setRequired(true)
                .addChoices(
                    { name: 'Actually', value: 'actually' },
                    { name: 'Artsy', value: 'artsy' },
                    { name: 'Blush', value: 'blush' },
                    { name: 'Bob Ross', value: 'bob_ross' },
                    { name: 'Bob Ross Baum', value: 'bob_ross_tree' },
                    { name: 'Cheesy', value: 'cheesy' },
                    { name: 'Closed Eyes', value: 'closed_eyes' },
                    { name: 'Eherm', value: 'eherm' },
                    { name: 'Eww', value: 'ew' },
                    { name: 'Laser', value: 'bitchpls' },
                    { name: 'Pirat', value: 'pirat' },
                    { name: 'Please', value: 'pls' },
                    { name: 'Ugh', value: 'ugh' },
                    { name: 'Waschbär', value: 'waschbaer' },
                    { name: 'Was', value: 'what' }
                )
        ),
    async execute(interaction) {
        if (!interaction.client.memberHasPermission(interaction.member)) {
            await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', flags: 64 }); // 64 = ephemeral
            return;
        }

        const text = interaction.options.getString("text");
        const imageType = interaction.options.getString("graphic");
        const imagePath = path.resolve(__dirname, `../../res/${imageType}.png`);

        // Vorab prüfen, ob die Grafik wirklich existiert
        if (!fs.existsSync(imagePath)) {
            await interaction.reply({ content: `Bild "${imageType}.png" nicht gefunden.`, flags: 64 });
            return;
        }

        // Canvas aufsetzen
        const canvas = Canvas.createCanvas(966, 576);
        const context = canvas.getContext('2d');
        const background = await Canvas.loadImage(imagePath);

        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Textblock-Parameter
        const font = "bold 42px Helvetica";
        context.font = font;
        context.fillStyle = "#000";
        context.textAlign = "left";
        context.textBaseline = "top";

        const x = 70;
        const y = 165;
        const maxWidth = 445;
        const maxHeight = 275;

        wrapTextBlock(context, text, x, y, maxWidth, maxHeight, 50);

        const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'graphic.png' });
        await interaction.reply({ files: [attachment] });
    },
};

// Utility-Funktion für einfachen Block-Textumbruch
function wrapTextBlock(ctx, text, x, y, maxWidth, maxHeight, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lines = [];
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    let totalHeight = lines.length * lineHeight;
    if (totalHeight > maxHeight) {
        // Text ist zu lang, schneide ab
        lines = lines.slice(0, Math.floor(maxHeight / lineHeight));
        lines[lines.length - 1] += ' ...';
    }

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + i * lineHeight);
    }
}
