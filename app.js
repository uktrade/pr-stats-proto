const axios = require('axios')

const getPRData = async () => {
    const resp = await axios.get('https://api.github.com/search/issues\?q\=is:pr+repo:uktrade/data-hub-frontend+author:mcbhenwood+is:merged+created:\>\=2019-09-01')
    return resp.data
}

const extractPrData = prData => prData.items.map(
    ({number, html_url, created_at, closed_at, user}) => {
        const lifetimeInHours = Math.round((new Date(closed_at) - new Date(created_at)) / 3600000)
        const summary = `lifetime ${lifetimeInHours}, number ${number}, author @${user.login}, html_url, ${html_url}`
        return {
            lifetimeInHours,
            summary
        }
    }
)

const orderPrListForDisplay = prList => [...prList].sort(
    (a, b) => b.lifetimeInHours - a.lifetimeInHours
)

const main = async () => {
    const prList = extractPrData(await getPRData())
    orderPrListForDisplay(prList).map(pr => console.log(pr.summary))
}

main()
