import logging
import tornado.websocket
from tornado.escape import json_decode

from zoearoundtheworld import utils


class ControlHandler(tornado.websocket.WebSocketHandler):

    @property
    def control(self):
        return self.application.settings["control"]

    @property
    def cookie_name(self):
        return self.application.settings.get("cookie_name")


    def get_current_user(self):
        '''accl = self.get_secure_cookie(self.cookie_name)
        if accl:
            return int(accl)'''
        return 1


    def open(self):
        if not self.current_user:
            self.close()
            return
        #self.user_record = self.control._get_user_by_id(self.current_user)
        logging.info("WebSocket opened")
        self.control._clients.append(self)
        #self.write_message({"user": self.user_record})


    def on_message(self, raw_message):
        message = utils.loads(raw_message)
        action = message.get("action")

        try:
            if action[0] == '_':
                raise Exception("Access violation")

            logging.info(message)
            args = message.get("args", {})

            method = getattr(self.control, action)

            #result = method(self.current_user, **args)
            result = method(**args)
            self.write_message(utils.dumps({"result": result,
                                            "response_id": message.get("request_id")}))
            self.control._flush()

        except Exception as ex:
            logging.exception(ex)
            error = str(ex)
            self.write_message({"result": None,
                                "error" : error,
                                "response_id": message.get("request_id"),
                                })
            self.control._flush(ex)

    def on_close(self):
        logging.info("WebSocket closed")
        self.control._clients.remove(self)

    def broadcast(self, message):
        self.write_message(message)
