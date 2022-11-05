import 'dotenv/config';
import express from 'express';
import cron from 'node-cron';
import { joinVoiceChannel, entersState, VoiceConnectionStatus, generateDependencyReport, AudioPlayerStatus, NoSubscriberBehavior, createAudioResource, createAudioPlayer } from '@discordjs/voice';
import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import fs from 'fs';
import { Readable } from 'node:stream';
import { join } from 'node:path';

const { Pause } = NoSubscriberBehavior;
const { Idle } = AudioPlayerStatus;
console.log(generateDependencyReport());
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });




//initializing bot
const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

async function connectToChannel(channel) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        return connection;
    } catch (error) {
        console.log(error);
        connection.destroy();
        throw error;
    }
}

client.on('ready', async () => {
    console.log('the client is ready');
    console.log(`Logged in as ${client.user.tag}!`);

    client.user.setActivity('Invite me on top.gg', {
        type: 'PLAYING',
        url: ""
    });
    await cron.schedule("*/15 * * * * *", async function () {
        try {

            console.log("---------------------");
            console.log("running a task every 15 seconds");
            const channel = await client.channels.fetch('890286827272028204');

            const connection = await connectToChannel(channel);
            const buffer = fs.readFileSync(join('./assets/audio', 'Trabalho Geografia Arthur Cunha 12-08-2020.mp3'));
            const readable = Readable.from(buffer);

            if (!buffer) {
                console.log("No buffer.");
            }

            if (!readable) {
                console.log("no readable");
            }

            const resource = createAudioResource(readable, {
                inlineVolume: true
            });
            console.log(resource);
            if (!resource) {
                console.log("no resource");
            }
            resource.volume.setVolume(1);

            const player = createAudioPlayer({
                behaviors: { noSubscriber: Pause }
            });

            connection.subscribe(player);

            player.play(resource);

            player.on('error', async () => {
                console.log("error");
                player.stop();
                connection.destroy();
            });

            player.on(Idle, () => {
                console.log("idle");
                player.stop();
                connection.destroy();
            });


            // connection.on(VoiceConnectionStatus.Ready, () => {
            //     console.log('The connection has entered the Ready state - ready to play audio!');
            //     setTimeout(() => { console.log("Sair do Canal"); }, 5_000);
            // });
            // Subscribe the connection to the audio player (will play audio on the voice connection)
            // const subscription = connection.subscribe(audioPlayer);

            // // subscription could be undefined if the connection is destroyed!
            // if (subscription) {
            //     // Unsubscribe after 5 seconds (stop playing audio on the voice connection)
            //     setTimeout(() => subscription.unsubscribe(), 5_000);
            // }


            // const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL);
            // await channel.send('uwu')

        } catch (error) {
            console.log(error);
        }
    });
});


client.on(' ', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        console.log(interaction.channel);
        await interaction.reply('Pong!');
    }
});

client.login(process.env.DISCORD_TOKEN);



