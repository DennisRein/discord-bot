const { MessageAttachment } = require('discord.js');

const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('canvas');
const CanvasTextBlock = require("canvas-text-block");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send-graphic')
        .setDescription('Sende eine Graphic aus dem Emotes und Grafiken channel')
        .addStringOption(channel => {
            return channel // Add return here
                .setName("text")
                .setDescription("Welcher Text soll auf die Grafik?")
                .setRequired(true)
        })
        .addStringOption(option =>
            option.setName('graphic')
                .setDescription('Willst du nur einen Eintrag ändern?')
                .setRequired(true)
                .addChoice('Actually', 'actually')
                .addChoice('Artsy', 'artsy')
                .addChoice('Blush', 'blush')
                .addChoice('Bob Ross', 'bob_ross')
                .addChoice('Bob Ross Baum', 'bob_ross_tree')
                .addChoice('Cheesy', 'cheesy')
                .addChoice('Closed Eyes', 'closed_eyes')
                .addChoice('Eherm', 'eherm')
                .addChoice('Eww', 'ew')
                .addChoice('Laser', 'laser')
                .addChoice('Pirat', 'pirat')
                .addChoice('Please', 'pls')
                .addChoice('Ugh', 'ugh')
                .addChoice('Waschbär', 'waschbaer')
                .addChoice('Was', 'what')
        ),
	async execute(interaction) {
        if(!interaction.client.memberHasPermission(interaction.member)) {
			await interaction.reply({ content: 'Ich reagiere nur auf Befehle von Globulis, tut mir leid.', ephemeral: true });	
			return; 
		}
        if(!interaction.client.configExists()) {
			await interaction.reply({ content: 'Es existiert noch keine Config, bitte benutze den /setup Befehl um mich zu initialisieren!', ephemeral: true });	
			return; 
		}
        
        let text = interaction.options.get("text").value;

        let imageType = interaction.options.get("graphic").value;

		const canvas = Canvas.createCanvas(966, 576);
		const context = canvas.getContext('2d');

        const background = await Canvas.loadImage(`res/${imageType}.png`);


        // This uses the canvas dimensions to stretch the image onto the entire canvas
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
    
        //context.fillStyle = 'black';
        //context.textAlign = 'center';

        //ctx.font = '150pt ARBLI___0'
        //context.fillText(text,10, 10)
        const font = "helvetica";

        const maxHeight = 275;
        const maxWidth = 445;
        const x = 70;
        const y = 165;


        const textBlock = new CanvasTextBlock(
            canvas,
            x, 
            y, 
            maxWidth,
            maxHeight,
            {
                fontFamily: font, // Set the font family of the text block
                fontSize: 42, // Set the font size in pixels
                color: "#000",
                weight: "bold"
            } 
          );

        textBlock.setText(text);

        const attachment = new MessageAttachment(canvas.toBuffer(), 'graphic.png');

        //const user = await interaction.client.users.fetch("338771212383551488").catch(console.error);
        //user.send({ files: [attachment] })

        interaction.reply({ files: [attachment] });
        
	},
};

function getFontSizeToFit(text, fontFace, maxWidth, maxHeight) {
    const canvas = Canvas.createCanvas(966, 576);
    const context = canvas.getContext('2d');
    context.font = `1px ${fontFace}`;
    console.log(context.measureText(text))
    return maxWidth*maxHeight / context.measureText(text).width;
}