import json


class Subject:
    def __init__(self, code, name, internal, external, total, grade, credits) -> None:
        self.code = code
        self.name = name
        self.internal = internal
        self.external = external
        self.total = total
        self.grade = grade
        self.credits = credits

    def toJSON(self):
        d = {
            "code": self.code,
            "name": self.name,
            "internal": self.internal,
            "external": self.external,
            "total": self.total,
            "grade": self.grade,
            "credits": self.credits,
        }
        return json.dumps(d)
