const axios = require('axios')

const getPRData = async () => {
    const resp = await axios.get('https://api.github.com/search/issues\?q\=is:pr+repo:uktrade/data-hub-frontend+author:mcbhenwood+is:merged+created:\>\=2019-09-01')
    return resp.data
}

const lifetimeInHours = (createdDateTimeString, closedDateTimeString) =>
    Math.round((new Date(closedDateTimeString) - new Date(createdDateTimeString)) / 3600000)

const formatPrLine = ({number, html_url, created_at, closed_at}) =>
    `lifetime ${lifetimeInHours(created_at, closed_at)}, number ${number}, html_url, ${html_url}`

const main = async () => {
    const data = await getPRData()
    data.items.map(pr => console.log(formatPrLine(pr)))
}

main()