# pr-stats-proto

Prototype for automated analysis of GitHub pull request stats.

## To run

Currently run at CL only, thus:
```
$ node app.js 2020-02-05 2020-02-18
```
where the two dates are start date and end date respectively, each expressed in YYYY-MM-DD format.
The PRs will be filtered to be between those two dates inclusively. No time element is associated with
this filter.

## Features

The prototype is currently being built to [this TODO list](TODO.md).
