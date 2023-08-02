const fs = require("fs");
const JSSoup = require("jssoup").default;
const axios = require("axios");

const resultURL = "http://results.jntuh.ac.in/resultAction";

let l = [];
for (let i = 1; i <= 60; ++i) l.push(i);

let branchcodes = JSON.parse(fs.readFileSync("./branchcodes.json"));
let codes = JSON.parse(fs.readFileSync("./data/codes.json"));

let semcodes = [];

for (let key in codes) {
    for (let code of codes[key]) {
        semcodes.push(code);
    }
}

semcodes = [...new Set(semcodes)];

semcodes = semcodes.filter((x) => x >= 1467);

console.log(semcodes);

function makeHTNO(year, college, course, no) {
    return `${year}${college}1A${course}${no > 9 ? no : "0" + String(no)}`;
}

function makeRequestBody(examcode, htno) {
    let details = {
        degree: "btech",
        examCode: examcode,
        etype: "r17",
        result: "null",
        grad: "null",
        type: "intgrade",
        htno: htno,
    };

    let formBody = [];

    for (var property in details) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
    }

    return formBody.join("&");
}

async function getRawResult(examcode, htno) {
    try {
        let promises = [];
        // let res = await fetch(resultURL, {
        //     method: "POST",
        //     body: makeRequestBody(examcode, htno),
        //     signal: AbortSignal.timeout(100000),
        // });

        for (let i = 0; i < 2; ++i)
            promises.push(
                axios.post(
                    resultURL,
                    {
                        degree: "btech",
                        examCode: examcode,
                        etype: "r17",
                        result: "null",
                        grad: "null",
                        type: "intgrade",
                        htno: htno,
                    },
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    }
                )
            );

        //console.log(promises);
        let res = await Promise.any(promises);
        console.log(`res: ${res}`);
        return {
            code: examcode,
            result: res,
        };
    } catch (e) {
        console.error("error: " + e);
        return {
            code: examcode,
            result: "no",
        };
    }
}

function parseResult(result) {
    var soup = new JSSoup(result);
    //console.log("Body: ");
    //console.log(result);

    try {
        var tables = soup.findAll("table");
        //console.log(`tables: ${tables}`);
        let trs = tables[1].findAll("tr");
        let subjects = [];
        let i = 0;
        for (let tr of trs) {
            if (i == 0) {
                i++;
                continue;
            }

            let tds = tr.findAll("td");
            let subject = new Subject(
                tds[0].text,
                tds[1].text,
                tds[2].text,
                tds[3].text,
                tds[4].text,
                tds[5].text,
                tds[6].text
            );
            subjects.push(subject);
        }

        return subjects;
    } catch {
        return "fuck you";
    }
}

async function getResults(htno) {
    let promises = [];
    for (let code of semcodes) {
        promises.push(getRawResult(code, htno));
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    let results = await Promise.all(promises);
    let out = [];
    for (let result of results) {
        if (result.result.status != 200) continue;
        if (result.result.headers.get("Content-Length") == 3774) continue;
        if (result.result == "no") continue;
        //console.log("X");
        //console.log(result.result);
        out.push({
            code: result.code,
            results: parseResult(result.result.data),
        });
    }
    fs.writeFileSync(`./jsresults/${htno}.json`, JSON.stringify(out));
    return out;
}

class Subject {
    constructor(code, name, internal, external, total, grade, credits) {
        this.code = code;
        this.name = name;
        this.internal = internal;
        this.external = external;
        this.total = total;
        this.grade = grade;
        this.credits = credits;
    }
}

class Results {
    constructor(subjects, name) {
        this.subjects = subjects;
        this.name = name;
    }
}

async function MRITSResults() {
    let resus = [];

    for (let n of l) {
        resus.push(getResults(makeHTNO(20, "S1", 66, n)));
    }

    let results = await Promise.all(resus);

    return results;
}

MRITSResults().then((res) => {
    for (let r of res) {
        console.log(r);
    }
});
