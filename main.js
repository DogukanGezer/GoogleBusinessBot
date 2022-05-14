const puppeteer = require('puppeteer');
const business = require('./business');
const puppeteerConfig = { headless: true }
const businessModel = require('./business')
const excel = require('exceljs')
const prompt = require('prompt-sync')({ sigint: false })

var url = 'https://www.google.com/search?tbm=lcl&q='
const bussinessSelector = '#rl_ist0 > div > div.rl_tile-group > div.rlfl__tls.rl_tls > div'
const titleSelector = '.SPZz6b'
const buttonSelector = 'div > div > a.C8TUKc.rllt__link.a-no-hover-decoration'
const detailPath = 'div.ifM9O'
const closeSelector = '#rhs > div > div.h2yBfgNjGpc__inline-item-view > div'

var allBusiness = []


async function main() {
    const input = prompt('Sayfa Adı Giriniz : ')
    url += encodeURIComponent(input) //prompt
    const browser = await puppeteer.launch(puppeteerConfig)
    var page = await browser.newPage()
    await page.goto(url)
    console.log('işlem 3 saniye sonra başlayacak')
    while (true) {
        await page.waitForTimeout(3000)
        var business = await page.$$(bussinessSelector)
        await page.waitForTimeout(1500)
        for (const perBusiness of business) {
            var id = await perBusiness.$eval('div', e => e.parentNode.id + e.parentNode.className)
            await openDetail(perBusiness)
<<<<<<< HEAD
            await page.waitForSelector('.SALvLe') // Adress Bilgilerini Bekle
            var title = await getTitle(page)
            var detail = await page.$$(detailPath).catch(() => { return undefined }) // Detay İçine Gir
            var data = await getDatas(detail[0])
            if (data != undefined) { await page.waitForTimeout(1500); await bodyParse(data, title) }
            else { console.log(undefined) }

=======
            await page.waitForTimeout(1500) // Adress Bilgilerini Bekle
            await setDatas(page)
>>>>>>> HEAD@{7}
        }
        saveXlsx(input)
        var nextButton = await page.$eval('#pnnext', e => { return e.innerText }).catch(() => { return null })
        if (nextButton == null) { console.log('İşlem Tamamlandı'); break; }
        await page.$eval('#pnnext', async (element) => { element.click(); })
        console.log('Diğer Sayfaya Geçiliyor')
        await page.waitForNavigation({ waitUntil: 'networkidle2' })

    }

}



async function openDetail(perBusiness) {
    await perBusiness.$eval(buttonSelector, async (element) => { element.click() }).catch(() => { }) //Detay Aç
}


async function setDatas(page) {
    const title = await page.$eval('.qrShPb', (e) => e.innerText).catch(() => { return undefined })
    const phone = await page.$eval('.kno-fv', (e) => e.innerText).catch(() => { return undefined })
    const pageUrl = await page.$eval('.QqG1Sd > a', (e) => { return e.href }).catch(() => { return undefined })
    const adress = await page.$eval('.LrzXr ', (e) => { return e.innerText }).catch(() => { return undefined })
    const time = await page.$eval('.WgFkxc ', (e) => { return e.innerText }).catch(() => { return undefined })
    const business = await new businessModel(title, adress, pageUrl, phone, time)
    console.log(business)
    allBusiness.push(business)
}




<<<<<<< HEAD
    var writeStream = await fs.createWriteStream('business.xls')
    const header = "title \t adress \t page \t phone \t time \n"
    await writeStream.write(header)
    await allBusiness.forEach((perBusiness) => {
        var row = perBusiness.title + "\t" + perBusiness.adress + "\t" + perBusiness.page + "\t" + perBusiness.phone + "\t" + perBusiness.time + "\n";
        writeStream.write(row)
=======
async function saveXlsx(input) {
    const fileName = input.split(' ').join('_') + '.xlsx'
    const wb = await new excel.Workbook()
    const ws = await wb.addWorksheet('Business List');
    ws.columns = await [
        { header: 'Title', key: 'Title' },
        { header: 'Adress', key: 'Adress' },
        { header: 'Page', key: 'Page' },
        { header: 'Phone', key: 'Phone' },
        { header: 'Time', key: 'Time' }
    ];
    await allBusiness.forEach((x) => {
        var row = ws.addRow({ Title: x.title, Adress: x.adress, Page: x.webPage, Phone: x.phone, Time: x.time });
        row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '96C8FB' },
            bgColor: { argb: '96C8FB' }
        };
>>>>>>> HEAD@{7}
    })
    await wb.xlsx.writeFile('./Datas/' + fileName);
}

main()