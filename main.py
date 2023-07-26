import requests as req
import json
import jsons
from sanitization import sanitize

for i in range(1, 61):
    x = req.get(
        "http://results.jntuh.ac.in/resultAction",
        {
            "degree": "btech",
            "examCode": "1645",
            "etype": "r17",
            "result": "null",
            "grad": "null",
            "type": "intgrade",
            "htno": "20S11A66" + (f"0{i}" if i < 10 else str(i)),
        },
    )
    if x.status_code != 200 or int(x.headers["Content-Length"]) == 3774:
        pass
    t = []
    try:
        t = sanitize(x)
    except:
        print(x.text)

    f = open(f"results/{i}.json", "w")
    s = "["
    for j in range(len(t)):
        s += t[j].toJSON()
        s += "," if j != len(t) - 1 else ""

    s += "]"
    f.write(s)
    f.close()


def htgen():
    f = open("branchcodes.json", "r")
    g = open("collegecodes.json", "r")
    h = open("rollnumber.json", "r")

    bc = json.loads(f.read())
    cc = json.loads(g.read())
    rn = json.loads(h.read())
    l = []
    for c in cc:
        for b in bc:
            for r in rn:
                l.append(f"20{c['Code']}1A{b['code']}{r}")
    print(l)
