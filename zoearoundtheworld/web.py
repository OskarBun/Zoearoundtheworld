import logging

import tornado.ioloop
import tornado.web
from tornado.options import parse_command_line, define, options
from pkg_resources import resource_filename  # @UnresolvedImport
from zoearoundtheworld.handlers.main_handler import MainHandler
from zoearoundtheworld.handlers.websocket_handler import ControlHandler
from zoearoundtheworld.control import Control


define("port", 8888, int, help="port to listen on")

def main():
	handlers = [
		(r"/websocket", ControlHandler),
		(r"/", MainHandler)
	]
	settings = dict(
		static_path = resource_filename('zoearoundtheworld',"www/static"),
		template_path = resource_filename('zoearoundtheworld',"www/templates"),
		control = Control(db_url = "sqlite:///test.db", drop_all = False),
		cookie_name = "zoearoundtheworld",
		cookie_secret = "it was a dark and stormy night @rsa",
		gzip = True,
		debug = True)
	application = tornado.web.Application(handlers, **settings)

	logging.info("Listening on port {}".format(options.port))
	application.listen(options.port)
	tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
	parse_command_line()
	main()
	
	
	
	
	