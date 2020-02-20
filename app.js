const axios = require('axios')

const getPRData = async (ownerRepo, fromDateTime) => {
    const fromDate = fromDateTime.toISOString().substring(0, 10)
    const query = `is:pr+repo:${ownerRepo}+is:merged+created:\>\=${fromDate}&per_page=100`
    const resp = await axios.get(`https://api.github.com/search/issues\?q\=${query}`)
    return resp.data
}


const prListReducer = ({totalLifetimeInHours, prCount}, {lifetimeInHours}) => ({
    totalLifetimeInHours: totalLifetimeInHours + lifetimeInHours,
    prCount: prCount + 1
})

const formatSummary = (repoName, {prCount, totalLifetimeInHours}, fromDateTime, teamName='ALL PRs') =>
    `${repoName} - ${teamName} - Since ${fromDateTime.toDateString()}: total PRs ${prCount}, total lifetime ${totalLifetimeInHours}h, mean ${Math.round(totalLifetimeInHours / prCount)}h`

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

const apiRepo = 'uktrade/data-hub-api'
const componentRepo = 'uktrade/data-hub-components'
const frontendRepo = 'uktrade/data-hub-frontend'
const repos = {apiRepo, componentRepo, frontendRepo}

const reportForRepo = async (repoName, ownerRepo) => {
    const fromDateTime = new Date(new Date() - 1209600000)
    const prList = extractPrData(await getPRData(ownerRepo, fromDateTime))
    const allPrSummary = summarisePrList(prList)
    console.log(formatSummary(repoName, allPrSummary, fromDateTime))
    for (let [teamName, teamFilter] of Object.entries(teamFilters)) {
        let teamPrSummary = summarisePrList(prList.filter(teamFilter))
        console.log(formatSummary(repoName, teamPrSummary, fromDateTime, teamName))
    }
    orderPrListForDisplay(prList).map(pr => console.log(pr.text))
}

const main = () => {
    for (let [repoName, ownerRepo] of Object.entries(repos)) {
        reportForRepo(repoName, ownerRepo)
    }
}

main()
