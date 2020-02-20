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

const formatSummary = ({prCount, totalLifetimeInHours}, fromDateTime, teamName='ALL PRs') =>
    `${teamName} - Since ${fromDateTime}: total PRs ${prCount}, total lifetime ${totalLifetimeInHours}h, mean ${Math.round(totalLifetimeInHours / prCount)}h`

const summarisePrList = prList => prList.reduce(
    prListReducer,
    {totalLifetimeInHours: 0, prCount: 0})

const extractPrData = (prData, fromDateTime) => prData.items.map(
    ({html_url, created_at, closed_at, user}) => {
        const lifetimeInHours = Math.round((new Date(closed_at) - new Date(created_at)) / 3600000)
        const text = `lifetime ${lifetimeInHours}h, ${html_url} author @${user.login}`
        return {
            author: user.login,
            lifetimeInHours,
            text
        }
    }
)

const orderPrListForDisplay = prList => [...prList].sort(
    (a, b) => b.lifetimeInHours - a.lifetimeInHours
)

const makeFilter = teamAuthorList => ({author}) => teamAuthorList.includes(author)

const blueTeamFilter = makeFilter(['alixedi', 'cgsunkel', 'currycoder', 'paulgain', 'rafenden'])
const purpleTeamFilter = makeFilter(['elcct', 'ian-leggett', 'mforner13', 'peterhudec', 'reupen'])
const yellowTeamFilter = makeFilter(['adamledwards', 'debitan', 'sekharpanja', 'web-bert'])
const teamFilters = {blueTeamFilter, purpleTeamFilter, yellowTeamFilter}

const main = async () => {
    const fromDateTime = new Date(new Date() - 1209600000)
    const prList = extractPrData(await getPRData(fromDateTime))
    const allPrSummary = summarisePrList(prList)
    console.log(formatSummary(allPrSummary, fromDateTime))
    for (let [teamName, teamFilter] of Object.entries(teamFilters)) {
        let teamPrSummary = summarisePrList(prList.filter(teamFilter))
        console.log(formatSummary(teamPrSummary, fromDateTime, teamName))
    }
    orderPrListForDisplay(prList).map(pr => console.log(pr.text))
}

main()
