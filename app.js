const ENV = require('dotenv');
ENV.config();

const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const prefix = "cc"
client.commands = new Discord.Collection();
const mongoose = require("mongoose");
const cooldowns = new Discord.Collection()

mongoose.connect('mongodb+srv://admin:Geronimo8!@caped-wetgx.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true
})




////////////////////////////////////////////////////////////////////////////////////////////

// command handler [Start]

const commandFiles = fs
    .readdirSync("./commands")
    .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    console.log(`${file} Scanned`);
}

// command handler [End]

client.once("ready", async () => {
    console.log("Caped is ready to rock :)");
    client.user.setActivity(`${prefix} help to start`, {
        type: "PLAYING"
    });
});

////////////////////////////////////////////////////////////////////////////////////////////

client.on("message", async message => {
    if (message.author.bot || message.channel.type === "dm") return;


    let args = message.content.slice(prefix.length + 1).split(/ +/);
    let commandName = args.shift().toLowerCase();
    const command =
        client.commands.get(commandName) ||
        client.commands.find(
            cmd => cmd.aliases && cmd.aliases.includes(commandName)
        );


    if (!command) return;

    // Calling Commands [Start]

    let errorEmbed = new Discord.MessageEmbed()
        .setColor('BLURPLE')

    if (message.content.startsWith(prefix)) {

        if (command.args && !args.length && !command.usage) {

            errorEmbed.addField("**~ Invalid Usage of Command ~**", "Join the support server for Caped! [Click here](https://discord.gg/xyAaUXu)")

            return message.channel.send(errorEmbed)

        } else if (command.usage && command.args && !args.length) {

            errorEmbed.addField(`**~ Invalid ~** Correct Usage Is ${command.usage}`, "Join the support server for Caped! [Click here](https://discord.gg/xyAaUXu)")

            return message.channel.send(errorEmbed);

        } else if (

            command.type == "moderation" &&

            !message.guild.member(message.author).hasPermission("MANAGE_MESSAGES")

        ) {
            return;
        }
    }

    // Calling Commands [End]

    ////////////////////////////////////////////////////////////////////////////////////////////

    // Cooldown [Start]

    if (message.content.startsWith(prefix)) {

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownTime = command.cooldown * 1000;

        if (timestamps.has(message.author.id)) {
            const expiredTime = timestamps.get(message.author.id) + cooldownTime;

            if (now < expiredTime) {
                const timeLeft = (expiredTime - now) / 1000;

                let coolembed = new Discord.MessageEmbed()
                coolembed.setColor(`BLURPLE`)



                if (timeLeft > 60) {

                    let left = Math.round(timeLeft / 60)
                    coolembed.setFooter(`Wait ${left} minute(s) before running this command again`, `https://i.imgur.com/uKWqKLi.png`)


                } else {

                    let left = Math.round(timeLeft)
                    coolembed.setFooter(`Wait ${left} second(s) before running this command again`, `https://i.imgur.com/uKWqKLi.png`)

                }

                return message.channel.send(coolembed);

            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownTime);
    }

    // Cooldown [End]

    ////////////////////////////////////////////////////////////////////////////////////////////

    if (message.content.startsWith(prefix)) {
        try {
            command.execute(message, args);
        } catch (error) {
            console.error(error);
        }
    }
});
client.login(process.env.BOT_TOKEN);

////////////////////////////////////////////////////////////////////////////////////////////