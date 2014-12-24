__author__ = 'OskarBunyan'

class Protocol(object):

    def entry_to_json(self, entry):
        return {
            "id": entry.id,
            "_type": "Entry",
            "title": entry.title,
            "date": entry.date,
            "country": entry.country,
            "text": entry.text
        }