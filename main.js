const puppeteer = require('puppeteer');
const business = require('./business');
const puppeteerConfig = { headless: false }
const businessModel = require('./business')
const fs = require('fs')
const url = 'https://www.google.com/search?q=uppsala+hair+salon&biw=800&bih=600&sz=0&tbm=lcl&ei=qjhsYqSTD6uRxc8P8sCr8AY&oq=uppsala+hair+salon&gs_l=psy-ab.3...0.0.0.8940.0.0.0.0.0.0.0.0..0.0....0...1c..64.psy-ab..0.0.0....0.kC5p5PUQ9Ns#rlfi=hd:;si:;mv:[[59.870175599999996,17.6746479],[59.8491153,17.6138911]];tbs:lrf:!1m4!1u3!2m2!3m1!1e1!1m4!1u2!2m2!2m1!1e1!2m1!1e2!2m1!1e3!3sIAE,lf:1,lf_ui:14'
const bussinessSelector = '#rl_ist0 > div > div.rl_tile-group > div.rlfl__tls.rl_tls > div'
const titleSelector = '.SPZz6b'
const buttonSelector = 'div > div > a.C8TUKc.rllt__link.a-no-hover-decoration'
const detailPath = 'div.ifM9O'
const closeSelector = '#rhs > div > div.h2yBfgNjGpc__inline-item-view > div'

var allBusiness = []


async function main() {

    const browser = await puppeteer.launch(puppeteerConfig)
    var page = await browser.newPage()
    await page.goto(url)
    var business = await page.$$(bussinessSelector)
    await page.waitForSelector(bussinessSelector)
    for (var perpage = 0; perpage < 1; perpage++) {

        for (const perBusiness of business) {

            await openDetail(perBusiness)
            await page.waitForSelector('.SALvLe') // Adress Bilgilerini Bekle
            var title = await getTitle(page)
            var detail = await page.$$(detailPath).catch(() => { return undefined }) // Detay İçine Gir
            var data = await getDatas(detail[0])
            if (data != undefined) { await page.waitForTimeout(1500); await bodyParse(data, title) }
            else { console.log(undefined) }

        }
        saveExcell()
        await page.$eval('#pnnext', async (element) => { element.click(); })
        await page.waitForTimeout(3000);
    }




}

async function getTitle(page) {
    var titleData = await page.$$(titleSelector).catch(() => { return undefined })
    if (titleData != undefined) {
        var title = await titleData[0].$eval('.SPZz6b > h2', element => element.innerText).catch(() => { return undefined })
        var url = await titleData[0].$eval('.QqG1Sd > a', element => element.href).catch(() => { return undefined })
        var titleJson = await { title: title, url: url }
        return titleJson
    }
    return { title: undefined, url: undefined }
}

async function openDetail(perBusiness) {
    var button = await perBusiness.$eval(buttonSelector, async (element) => { element.click() }).catch(() => { }) //Detay Aç
}

async function getDatas(detail) {
    var data = await detail.$eval('.SALvLe', element => element.innerText).catch(() => { return undefined })//Selector Sıkıntı
    return data
}

async function bodyParse(data, titleData) {
    data += "\n"
    const adres = data.split(new RegExp('(?<=Adres:)(.*)(?=\n)'))[1]
    const phone = data.split(new RegExp('(?<=Telefon:)(.*)(?=\n)'))[1]
    const time = data.split(new RegExp('(?<=Kapanış saati:)(.*)(?=\n)'))[1]
    var business = await new businessModel(titleData.title, adres, titleData.url, phone, time).getJson()
    allBusiness.push(business)
}


async function saveExcell() {


    var writeStream = await fs.createWriteStream('business.xls')
    const header = "title \t adress \t page \t phone \t time \n"
    await writeStream.write(header)
    await allBusiness.forEach((perBusiness) => {
        var row = perBusiness.title + "\t" + perBusiness.adress + "\t" + perBusiness.page + "\t" + perBusiness.phone + "\t" + perBusiness.time + "\n";
        writeStream.write(row)
    })
    writeStream.close()



}




main()