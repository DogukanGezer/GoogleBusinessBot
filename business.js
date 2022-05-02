

class business {
    constructor(title, adress, webPage, phone, time) {
        this.title = title
        this.adress = adress
        this.webPage = webPage
        this.phone = phone
        this.time = time
    }

    getJson() {
        const json = {
            title: this.title,
            adress: this.adress,
            page: this.webPage,
            phone: this.phone,
            time: this.time
        }
        return json
    }
}


module.exports = business