
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');
const cors = require('cors');
const { FieldValue } = require('@google-cloud/firestore');
const Note = require('./config');
// const { Bot, webhookCallback } = require('grammy');

const { TELEGRAM_TOKEN, SERVER_URL, API_WIKI, API_CUACA } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const URI = `/webhook/${TELEGRAM_TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

const app = express()

app.use(bodyParser.json())
app.use(cors())


const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log(res.data)
}


// ========================== Bot ==========================

const bot = new Telegraf(TELEGRAM_TOKEN); // asistenpurno_bot

bot.start((ctx) => ctx.reply('Assalamualaikum, saya asisten purno, silahkan ketik /help untuk melihat perintah yang tersedia'));


bot.command('help', (ctx) => {
    ctx.replyWithHTML(`<b>Perintah yang tersedia:</b> 
    /help - menampilkan perintah yang tersedia
    /info - menampilkan info bot
    /wiki [text] - menampilkan hasil pencarian wikipedia
    /note [text] - membuat catatan
    /note - menampilkan catatan`);

    ctx.telegram.deleteWebhook;
});

bot.command('info', async (ctx) => {
    ctx.replyWithHTML(`<b>Info bot:</b> 
    <b>Bot Name:</b> asistenpurno_bot
    <b>Bot Username:</b> @asistenpurno_bot

    <b>Bot dibuat pada:</b> 07 Maret 2023`);

    ctx.telegram.deleteWebhook;
});


// wikipedia hasil tidak jelas
bot.command('wiki', async (ctx) => {

    ctx.reply('Dalam proses pengembangan');

    const query = ctx.message.text.split(' ').slice(1).join(' ');

    if (!query) {
        return ctx.reply('Silahkan masukkan kata kunci untuk pencarian');
    }

    const res = await axios.get(`${API_WIKI}+${query}`);
    const { title, timestamp } = res.data.query.search[0];

    // console.log(`ini dia: ${API_WIKI}+${query} dann iniiii ${res1.data.query.search[0]} dan juga ini ${res.data.query.search[0].title}`)

    // console.log(query)

    ctx.replyWithHTML(`<b>${title}</b>
    ${timestamp}`);
    ctx.telegram.deleteWebhook;

});


// belum berhasil (menampilkan cuaca)
bot.command('cuaca', async (ctx) => {

    ctx.reply('Dalam proses pengembangan');

    const query = ctx.message.text.split(' ').slice(1).join(' ');

    if (!query) {
        return ctx.reply('Silahkan masukkan nama kota untuk mengetahui cuaca');
    }

    const res = await axios.get(`${API_CUACA}${query}`);
    const { description, level } = res.data;
    const { data, lon } = res;

    // console.log(res.data, typeof lon)

    ctx.replyWithHTML(`<b>${data}</b>
    ${level, lon}`)
    ctx.telegram.deleteWebhook;

});

bot.command('note', async (ctx) => {
    const query = ctx.message.text.split(' ').slice(1).join(' ');
    const snapshot = await Note.orderBy('timestamp', 'desc').get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (!query) {
        return ctx.reply(`Silahkan masukkan note untuk disimpan`)
    }

    // waktu
    const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })

    const ID = ctx.chat.id + data.length + 1;

    const toString = (ID) => { return ID.toString() };

    var notes = {
        "id_pribadi": toString(ID),
        "note": query,
        "id_tele": ctx.chat.id,
        "tgl": waktu,
        "timestamp": FieldValue.serverTimestamp()
    }

    await Note.add(notes);

    ctx.reply(`Note berhasil disimpan`)
    ctx.telegram.deleteWebhook;
});

bot.command('lihat', async (ctx) => {
    const id_tele = ctx.chat.id;
    const snapshot = await Note.orderBy('timestamp', 'asc').where('id_tele', '==', id_tele).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    var query = ctx.message.text.split(' ').slice(1).join(' ');

    if (snapshot.empty) {
        return ctx.reply(`Note kosong`)
    }

    if (!query) {
        // snapshot.forEach(doc => {console.log(doc.id, '=>', doc.data())});
        ctx.telegram.sendMessage(ctx.chat.id, `Pilih note yang ingin dilihat antara 1 - ${data.length} \n\n Reply /lihat [nomor]`)
    } else {
        if (data.length < query) {
            return ctx.reply(`Note tidak ditemukan`)
        } else {
            query--;
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    if (query == key) {
                        var a = query + 1;
                        ctx.telegram.sendMessage(ctx.chat.id, `No: ${a} \nNote: ${data[query].note} \n\n\nTanggal: ${data[query].tgl}`)
                    }
                }
            }
        }
    }
    ctx.telegram.deleteWebhook;
});


bot.command('hapus', async (ctx) => {
    const id_tele = ctx.chat.id;
    const snapshot = await Note.orderBy('timestamp', 'asc').where('id_tele', '==', id_tele).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    var query = ctx.message.text.split(' ').slice(1).join(' ');

    if (snapshot.empty) {
        return ctx.reply(`Note kosong`)
    }

    if (!query) {
        // snapshot.forEach(doc => {console.log(doc.id, '=>', doc.data())});
        ctx.telegram.sendMessage(ctx.chat.id, `Pilih note yang ingin dihapus antara 1 - ${data.length} \n\n Reply /hapus [nomor]`)
    } else {
        if (data.length < query) {
            return ctx.reply(`Note tidak ditemukan`)
        } else {
            query--;
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    if (query == key) {
                        console.log('Berhasil dihapus');
                        const ID = data[key].id;
                        var a = query + 1;
                        delete ID;
                        await Note.doc(ID).delete();
                        ctx.telegram.sendMessage(ctx.chat.id, `No: ${a} \nBerhasil dihapus`)
                    }
                }
            }
        }
    }
    ctx.telegram.deleteWebhook;
});





// Start the server
if (process.env.NODE_ENV === "production") {
    // Use Webhooks for the production server
    // const app = express();
    // app.use(express.json());
    // app.use(webhookCallback(bot, "express"));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, async () => {
        bot.launch(console.log());
        console.log(`Bot listening on port ${PORT}`);
        await init();
    });
} else {
    // Use Long Polling for development
    bot.launch();
}




// export TELEGRAM_API_TOKEN=2130991418:AAGM6JiUtzppbqQrXFWYjTju30TjYYbT4YI
// export TELEGRAM_WEBHOOK_URL=https://puzzled-tick-top-hat.cyclic.app

// curl "https://api.telegram.org/bot$TELEGRAM_API_TOKEN/setWebhook?url=$TELEGRAM_WEBHOOK_URL"

// app.listen(process.env.PORT || 6000, async () => {
//     bot.launch(console.log());
//     console.log('🚀 app running on port', process.env.PORT || 6000)
//     await init()
// })