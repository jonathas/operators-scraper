const util = require('util');
const fs = require('fs');
const cheerio = require('cheerio');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const readFranchised = async() => {
    const table = await readFile(`${__dirname}/franchised.html`, 'utf8');

    return cheerio.load(table);
};

const readNotFranchised = async() => {
    const notFranchised = await readFile(`${__dirname}/not-franchised.html`, 'utf8');

    return cheerio.load(notFranchised);
};

const scrapeFranchised = async() => {
    let $ = await readFranchised();

    let obj = {};

    let franchises = [];
    let codes = [];

    $('th').each(function () {
        let th = $(this);

        if (th.text() === 'Franchise') {
            franchises.push(th.siblings('td').text());
        }

        if (th.text() === 'GB timetable code') {
            codes.push(th.siblings('td').text());
        }
    });

    franchises.map((item, index) => {
        Object.assign(obj, {
            [codes[index]]: item
        });
    });

    return obj;
};

const scrapeNotFranchised = async() => {
    let $ = await readNotFranchised();

    let obj = {};

    let descriptions = [];
    let codes = [];

    $('tr').each(function () {
        let tr = $(this);

        descriptions.push(tr.children('td').first().text());
        codes.push(tr.children('td').first().siblings('td').first().text());
    });

    descriptions.map((item, index) => {
        Object.assign(obj, {
            [codes[index]]: item
        });
    });

    return obj;
};

const getOperators = async() => {
    let franchised = await scrapeFranchised();
    let notFranchised = await scrapeNotFranchised();

    return Object.assign(franchised, notFranchised);
}

getOperators().then(obj => {
    return writeFile("./operators.json", JSON.stringify(obj));
});