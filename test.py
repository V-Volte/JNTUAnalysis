import json


def htgen():
    f = open("branchcodes.json", "r")
    g = open("collegecodes.json", "r")
    h = open("rollnumber.json", "r")

    bc = json.loads(f.read())
    cc = json.loads(g.read())
    for c in cc:
        print(c["Code"])


htgen()
