const axios = require('axios')

const getPRData = async (ownerRepo, fromDate, toDate) => {
    const query = `is:pr+repo:${ownerRepo}+is:merged+created:${fromDate}..${toDate}&per_page=100`
    const resp = await axios.get(`https://api.github.com/search/issues\?q\=${query}`)
    return resp.data
}


const prListReducer = ({totalLifetimeInDays, prCount}, {lifetimeInDays}) => ({
    totalLifetimeInDays: totalLifetimeInDays + lifetimeInDays,
    prCount: prCount + 1
})

const formatSummary = (repoName, {prCount, totalLifetimeInDays}, fromDate, toDate, teamName='ALL PRs') =>
    `${fromDate} to ${toDate}: ${repoName} - ${teamName} - total PRs ${prCount}, total lifetime ${totalLifetimeInDays}d, mean ${Math.round(10 * (totalLifetimeInDays / prCount)) / 10}d`

const summarisePrList = prList => prList.reduce(
    prListReducer,
    {totalLifetimeInDays: 0, prCount: 0})

const extractPrData = (prData, fromDateTime) => prData.items.map(
    ({html_url, created_at, closed_at, user, comments}) => {
        const lifetimeInDays = Math.round(10*((new Date(closed_at) - new Date(created_at)) / 86400000)) / 10
        const text = `${html_url} author @${user.login}, comments: ${comments}, lifetime ${lifetimeInDays}d`
        return {
            author: user.login,
            lifetimeInDays,
            text
        }
    }
)

const orderPrListForDisplay = prList => [...prList].sort(
    (a, b) => b.lifetimeInDays - a.lifetimeInDays
)

const reportForRepo = async (repoName, ownerRepo, fromDate, toDate, teamFilters) => {
    const prList = extractPrData(await getPRData(ownerRepo, fromDate, toDate))
    const allPrSummary = summarisePrList(prList)
    console.log(formatSummary(repoName, allPrSummary, fromDate, toDate))
    for (let [teamName, teamFilter] of Object.entries(teamFilters)) {
        let teamPrSummary = summarisePrList(prList.filter(teamFilter))
        console.log(formatSummary(repoName, teamPrSummary, fromDate, toDate, teamName))
    }
    orderPrListForDisplay(prList).map(pr => console.log(pr.text))
}

const main = async (repos, fromDate, toDate, teamFilters) => {
    for (let [repoName, ownerRepo] of Object.entries(repos)) {
        await reportForRepo(repoName, ownerRepo, fromDate, toDate, teamFilters)
    }
}

const fromDate = process.argv[2]
const toDate = process.argv[3]

const makeFilter = teamAuthorList => ({author}) => teamAuthorList.includes(author)
const blueTeamFilter = makeFilter(['alixedi', 'cgsunkel', 'currycoder', 'laurenqurashi', 'paulgain', 'rafenden'])
const purpleTeamFilter = makeFilter(['elcct', 'ian-leggett', 'mforner13', 'peterhudec', 'rachaelcodes', 'reupen'])
const yellowTeamFilter = makeFilter(['adamledwards', 'debitan', 'PippoRaimondi', 'sekharpanja', 'web-bert'])
const teamFilters = {blueTeamFilter, purpleTeamFilter, yellowTeamFilter}

const apiRepo = 'uktrade/data-hub-api'
const componentRepo = 'uktrade/data-hub-components'
const frontendRepo = 'uktrade/data-hub-frontend'
const repos = {apiRepo, componentRepo, frontendRepo}

main(repos, fromDate, toDate, teamFilters)
