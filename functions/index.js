const functions = require('firebase-functions');

const express = require('express')
const puppeteer = require('puppeteer')

const app = express()

app.all('*', async (req, res, next) => {
    res.locals.browser = await puppeteer.launch({
        args: ['--no-sandbox']
    })
    next()
})

app.post('/screenshot', async (req, res) => {
    const html = req.body.html

    if (!html) {
        return res.status(400).send("HTMLがありません")
    }

    const browser = res.locals.browser;
    try {
        const page = await browser.newPage()
        await page.goto(`data:text/html,${html}`, {waitUntil: 'networkidle2'})

        const buffer = await page.screenshot({
            fullPage: true
        });
        return res.type('image/png').send(buffer);
    } catch (e) {
        return res.status(500).send(e.toString())
    }

})

app.post('/pdf', async (req, res) => {
    const html = req.body.html

    if (!html) {
        return res.status(400).send("HTMLがありません")
    }

    const browser = res.locals.browser;
    try {
        const page = await browser.newPage()
        await page.goto(`data:text/html,${html}`, {waitUntil: 'networkidle2'})

        const buffer = await page.pdf({
            fullPage: true
        });
        return res.type('application/pdf').send(buffer);
    } catch (e) {
        return res.status(500).send(e.toString())
    }
})


app.get('/version', async (req, res) => {
    const browser = res.locals.browser;
    res.status(200).send(await browser.version());
    await browser.close();
})

const beefyOpts = {memory: '2GB', timeoutSeconds: 60};
exports.screenshot = functions.runWith(beefyOpts).https.onRequest(app);
exports.version = functions.https.onRequest(app)
exports.pdf = functions.runWith(beefyOpts).https.onRequest(app)