const axios = require('axios')

const getPRData = async (fromDateTime) => {
    const fromDate = fromDateTime.toISOString().substring(0, 10)
    const query = `is:pr+repo:uktrade/data-hub-frontend+is:merged+created:\>\=${fromDate}&per_page=100`
    const resp = await axios.get(`https://api.github.com/search/issues\?q\=${query}`)
    return resp.data
}


const prListReducer = ({totalLifetimeInHours, prCount}, {lifetimeInHours}) => ({
    totalLifetimeInHours: totalLifetimeInHours + lifetimeInHours,
    prCount: prCount + 1
})

const formatSummary = ({prCount, totalLifetimeInHours}, fromDateTime) =>
    `Since ${fromDateTime}: total PRs ${prCount}, total lifetime ${totalLifetimeInHours}, mean ${Math.round(totalLifetimeInHours / prCount)}`

const summarisePrList = prList => prList.reduce(
    prListReducer,
    {totalLifetimeInHours: 0, prCount: 0})

const extractPrData = (prData, fromDateTime) => prData.items.map(
    ({number, html_url, created_at, closed_at, user}) => {
        const lifetimeInHours = Math.round((new Date(closed_at) - new Date(created_at)) / 3600000)
        const text = `lifetime ${lifetimeInHours}, number ${number}, author @${user.login}, html_url, ${html_url}`
        return {
            lifetimeInHours,
            text
        }
    }
)

const orderPrListForDisplay = prList => [...prList].sort(
    (a, b) => b.lifetimeInHours - a.lifetimeInHours
)

const main = async () => {
    const fromDateTime = new Date(new Date() - 1209600000)
    const prList = extractPrData(await getPRData(fromDateTime))
    const prSummary = summarisePrList(prList)
    console.log(formatSummary(prSummary, fromDateTime))
    orderPrListForDisplay(prList).map(pr => console.log(pr.text))
}

main()
