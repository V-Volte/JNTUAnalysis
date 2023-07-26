import pandas as pd
from bs4 import BeautifulSoup
from subject import Subject


def sanitize(x):
    soup = BeautifulSoup(x.text, "lxml")

    tables = pd.read_html(x.text)
    reqtab = tables[0]
    reqtab2 = tables[1]

    tables = soup.find_all("table")

    trs = tables[1].find_all("tr")
    l = []
    i = 0
    for tr in trs:
        if i != 0:
            tds = tr.find_all("td")
            s = Subject(
                tds[0].text,
                tds[1].text,
                tds[2].text,
                tds[3].text,
                tds[4].text,
                tds[5].text,
                tds[6].text,
            )
            l.append(s)
        i += 1
    return l
